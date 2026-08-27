import { env } from 'cloudflare:workers'
import { getAuth } from './auth.server'
import { listGameLogos } from './game-logos.server'
import { ARCHIVE_DAYS, dayIndexFor, pickLogo, resolveGuesses, rewardFor, type GameStatus, type Guess } from './game-logic'

// game-logic.ts's EPOCH is built from local Date components, so it resolves
// to a different real instant per runtime timezone (this server always runs
// in UTC; a browser doesn't). Combined with the DST offset difference
// between January (when EPOCH is defined) and whatever month "now" falls
// in, a client's own dayIndexFor(now()) can disagree with this server's by
// a full day even in the middle of the afternoon, not just near a midnight
// boundary. 2 days of slack covers that plus a genuine (bounded ±1 day)
// real-world timezone offset between an unknown client timezone and UTC.
const TIMEZONE_SLACK_DAYS = 2

interface ProgressRow {
  day_index: number
  status: GameStatus
  guesses_json: string
  reward: number
}

async function currentUserId(headers: Headers): Promise<string | null> {
  const session = await getAuth().api.getSession({ headers })
  return session?.user.id ?? null
}

export async function syncDay(
  headers: Headers,
  input: { anonId: string; dayIndex: number; guesses: string[] },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await currentUserId(headers)

  if (!userId && (typeof input.anonId !== 'string' || input.anonId.length === 0)) {
    return { ok: false, error: 'missing anon id' }
  }
  if (!Number.isInteger(input.dayIndex) || !Array.isArray(input.guesses)) {
    return { ok: false, error: 'invalid payload' }
  }

  const serverToday = dayIndexFor(new Date())

  if (input.dayIndex > serverToday + TIMEZONE_SLACK_DAYS) {
    return { ok: false, error: 'future day' }
  }
  if (!userId && input.dayIndex < serverToday - ARCHIVE_DAYS - TIMEZONE_SLACK_DAYS) {
    return { ok: false, error: 'day too old for anonymous sync' }
  }

  const bank = await listGameLogos()
  if (bank.length === 0) {
    return { ok: false, error: 'no logo bank available' }
  }
  const logo = pickLogo(bank, input.dayIndex)
  const { guesses, status } = resolveGuesses(input.guesses, logo)
  if (status === 'playing') {
    return { ok: false, error: 'day not resolved by submitted guesses' }
  }

  // Symmetric, not asymmetric: a client's local calendar day can legitimately
  // disagree with this UTC server's in EITHER direction (a timezone behind
  // UTC can have local dayIndex = serverToday - 1 while genuinely playing
  // "today", same as one ahead can be serverToday + 1) — see the
  // TIMEZONE_SLACK_DAYS comment above for why the gap can reach a full day
  // even without any real timezone offset at all.
  const isFreshToday = Math.abs(input.dayIndex - serverToday) <= TIMEZONE_SLACK_DAYS
  const reward = rewardFor(status, guesses, isFreshToday)

  await env.DB.prepare(
    `INSERT OR IGNORE INTO progress (anon_id, user_id, day_index, status, guess_count, guesses_json, reward)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      userId ? null : input.anonId,
      userId,
      input.dayIndex,
      status,
      guesses.length,
      JSON.stringify(guesses),
      reward,
    )
    .run()

  return { ok: true }
}

// `anonId` is fully client-supplied and unauthenticated by design (spec:
// anonymous play must stay usable with zero server round-trips beyond the
// completion sync) — its only protection against being claimed by the
// wrong account is UUIDv4 entropy, which is intentionally deemed
// sufficient for this low-stakes, non-financial data.
export async function claimAnon(headers: Headers, anonId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await currentUserId(headers)
  if (!userId) {
    return { ok: false, error: 'not authenticated' }
  }
  await env.DB.batch([
    env.DB.prepare(
      `DELETE FROM progress WHERE anon_id = ? AND day_index IN (SELECT day_index FROM progress WHERE user_id = ?)`,
    ).bind(anonId, userId),
    env.DB.prepare(`UPDATE progress SET user_id = ?, anon_id = NULL WHERE anon_id = ?`).bind(userId, anonId),
  ])
  return { ok: true }
}

export async function myProgress(
  headers: Headers,
): Promise<Record<string, { status: GameStatus; guesses: Guess[]; reward: number }> | null> {
  const userId = await currentUserId(headers)
  if (!userId) return null
  const { results } = await env.DB.prepare(
    `SELECT day_index, status, guesses_json, reward FROM progress WHERE user_id = ?`,
  )
    .bind(userId)
    .all<ProgressRow>()
  const out: Record<string, { status: GameStatus; guesses: Guess[]; reward: number }> = {}
  for (const row of results) {
    out[String(row.day_index)] = {
      status: row.status,
      guesses: JSON.parse(row.guesses_json) as Guess[],
      reward: row.reward,
    }
  }
  return out
}
