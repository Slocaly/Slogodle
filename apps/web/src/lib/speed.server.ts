import { getRequestHeaders } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { getAuth } from "./auth.server";
import { listGameLogos } from "./game-logos.server";
import { dayIndexFor } from "./game-logic";
import {
  SPEED_FINISH_GRACE_MS,
  SPEED_MAX_RUN_MS,
  checkSpeedGuesses,
  dailySpeedLogos,
  speedScore,
} from "./speed";
import type { SpeedRunState } from "./speed-runs";

// See progress.server.ts: the client's calendar day can legitimately differ
// from this UTC server's by a day or two.
const TIMEZONE_SLACK_DAYS = 2;

interface SpeedRunRow {
  id: number;
  started_at: number;
  finished_at: number | null;
  duration_ms: number | null;
  wrong_count: number | null;
  score_ms: number | null;
}

interface Identity {
  userId: string | null;
  anonId: string | null;
}

async function identify(anonId: unknown): Promise<Identity> {
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
  if (session) return { userId: session.user.id, anonId: null };
  if (typeof anonId !== "string" || anonId.length === 0 || anonId.length > 100) {
    throw new Error("missing anon id");
  }
  return { userId: null, anonId };
}

/**
 * A ranked run is for today's series only. A replay is for any earlier one
 * (strictly before the server's today, so it can't be used as a free practice
 * run ahead of the ranked one).
 */
function assertPlayableDay(dayIndex: unknown, isReplay: boolean): asserts dayIndex is number {
  if (!Number.isInteger(dayIndex)) throw new Error("invalid day");
  const today = dayIndexFor(new Date());
  if (isReplay) {
    if ((dayIndex as number) < 0 || (dayIndex as number) >= today) {
      throw new Error("day not replayable");
    }
  } else if (Math.abs((dayIndex as number) - today) > TIMEZONE_SLACK_DAYS) {
    throw new Error("day not playable");
  }
}

async function findRun(
  who: Identity,
  dayIndex: number,
  isReplay: boolean,
): Promise<SpeedRunRow | null> {
  const column = who.userId ? "user_id" : "anon_id";
  return env.DB.prepare(
    `SELECT id, started_at, finished_at, duration_ms, wrong_count, score_ms
     FROM speed_run WHERE ${column} = ? AND day_index = ? AND is_replay = ?`,
  )
    .bind(who.userId ?? who.anonId, dayIndex, isReplay ? 1 : 0)
    .first<SpeedRunRow>();
}

function toState(row: SpeedRunRow | null): SpeedRunState {
  const serverNow = Date.now();
  if (!row) return { status: "none", serverNow };
  if (row.finished_at === null) {
    if (serverNow - row.started_at > SPEED_MAX_RUN_MS) {
      return { status: "expired", startedAt: row.started_at, serverNow };
    }
    return { status: "running", startedAt: row.started_at, serverNow };
  }
  return {
    status: "finished",
    startedAt: row.started_at,
    serverNow,
    result: {
      durationMs: row.duration_ms ?? 0,
      wrongCount: row.wrong_count ?? 0,
      scoreMs: row.score_ms ?? 0,
    },
  };
}

interface RunInput {
  anonId: string;
  dayIndex: number;
  /** True for a replay of a past series (never ranked). */
  replay?: boolean;
}

export async function getSpeedRun(input: RunInput) {
  const isReplay = input.replay === true;
  // Reading a ranked run is harmless for any past day (the history page shows
  // it); only starting or finishing one is limited to today.
  if (isReplay || input.dayIndex > dayIndexFor(new Date()) + TIMEZONE_SLACK_DAYS) {
    assertPlayableDay(input.dayIndex, isReplay);
  } else if (!Number.isInteger(input.dayIndex) || input.dayIndex < 0) {
    throw new Error("invalid day");
  }
  const who = await identify(input.anonId);
  return toState(await findRun(who, input.dayIndex, isReplay));
}

/** Idempotent: a second call (reload, other device) returns the existing run. */
export async function startSpeedRun(input: RunInput) {
  const isReplay = input.replay === true;
  assertPlayableDay(input.dayIndex, isReplay);
  const who = await identify(input.anonId);
  await env.DB.prepare(
    `INSERT OR IGNORE INTO speed_run (anon_id, user_id, day_index, started_at, is_replay) VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(who.anonId, who.userId, input.dayIndex, Date.now(), isReplay ? 1 : 0)
    .run();
  return toState(await findRun(who, input.dayIndex, isReplay));
}

export async function finishSpeedRun(input: RunInput & { guesses: string[][] }) {
  const isReplay = input.replay === true;
  assertPlayableDay(input.dayIndex, isReplay);
  const who = await identify(input.anonId);
  const run = await findRun(who, input.dayIndex, isReplay);
  if (!run) throw new Error("run not started");
  if (run.finished_at !== null) return toState(run);
  if (Date.now() - run.started_at > SPEED_MAX_RUN_MS + SPEED_FINISH_GRACE_MS) {
    throw new Error("run expired");
  }

  const bank = await listGameLogos();
  const logos = dailySpeedLogos(bank, input.dayIndex);
  const misses = checkSpeedGuesses(logos, input.guesses);
  if (!misses) throw new Error("guesses do not solve the series");

  const finishedAt = Date.now();
  const wrongCount = misses.reduce((sum, n) => sum + n, 0);
  const result = speedScore(finishedAt - run.started_at, wrongCount);

  await env.DB.prepare(
    `UPDATE speed_run
     SET finished_at = ?, duration_ms = ?, wrong_count = ?, score_ms = ?, wrong_counts_json = ?
     WHERE id = ? AND finished_at IS NULL`,
  )
    .bind(finishedAt, result.durationMs, wrongCount, result.scoreMs, JSON.stringify(misses), run.id)
    .run();

  return toState(await findRun(who, input.dayIndex, isReplay));
}

export interface LadderEntry {
  name: string;
  durationMs: number;
  wrongCount: number;
  scoreMs: number;
  isMe: boolean;
}

/** Stable, non-reversible display tag for an anonymous player: "Anon #4F2A". */
function anonName(anonId: string): string {
  let h = 0x811c9dc5; // FNV-1a
  for (let i = 0; i < anonId.length; i++) {
    h ^= anonId.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `Anon #${(h & 0xffff).toString(16).toUpperCase().padStart(4, "0")}`;
}

interface LadderRow {
  name: string | null;
  anonId: string | null;
  durationMs: number;
  wrongCount: number;
  scoreMs: number;
  isMe: number;
}

/**
 * Day ladder: accounts and anonymous players, ranked together. Replays are
 * never on it. The ladder of a past day stays hidden (null) until the caller
 * has finished that series, either ranked on the day or as a replay.
 */
export async function getSpeedLadder(input: {
  dayIndex: number;
  anonId?: string;
}): Promise<LadderEntry[] | null> {
  if (!Number.isInteger(input.dayIndex)) throw new Error("invalid day");
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
  const meUser = session?.user?.id ?? "";
  const meAnon =
    !session && typeof input.anonId === "string" && input.anonId.length > 0 && input.anonId.length <= 100
      ? input.anonId
      : "";
  if (input.dayIndex < dayIndexFor(new Date())) {
    const played =
      meUser || meAnon
        ? await env.DB.prepare(
            `SELECT 1 AS ok FROM speed_run
             WHERE day_index = ? AND finished_at IS NOT NULL AND (user_id = ? OR anon_id = ?)
             LIMIT 1`,
          )
            .bind(input.dayIndex, meUser, meAnon)
            .first<{ ok: number }>()
        : null;
    if (!played) return null;
  }
  const { results } = await env.DB.prepare(
    `SELECT u.name AS name, r.anon_id AS anonId, r.duration_ms AS durationMs, r.wrong_count AS wrongCount,
            r.score_ms AS scoreMs, (r.user_id = ? OR r.anon_id = ?) AS isMe
     FROM speed_run r LEFT JOIN user u ON u.id = r.user_id
     WHERE r.day_index = ? AND r.finished_at IS NOT NULL AND r.is_replay = 0
     ORDER BY r.score_ms ASC, r.finished_at ASC
     LIMIT 50`,
  )
    .bind(meUser, meAnon, input.dayIndex)
    .all<LadderRow>();
  // anon_id is a credential for that run: only a derived tag leaves the server.
  return results.map((r) => ({
    name: r.name ?? anonName(r.anonId ?? ""),
    durationMs: r.durationMs,
    wrongCount: r.wrongCount,
    scoreMs: r.scoreMs,
    isMe: r.isMe === 1,
  }));
}

export interface SpeedStanding {
  scoreMs: number;
  /** Rank on the day ladder (accounts and anonymous players together). */
  rank: number;
}

/** The caller's finished run for the day, or null if they haven't finished one. */
export async function getSpeedStanding(input: {
  anonId: string;
  dayIndex: number;
}): Promise<SpeedStanding | null> {
  assertPlayableDay(input.dayIndex, false);
  const who = await identify(input.anonId);
  const run = await findRun(who, input.dayIndex, false);
  if (!run || run.finished_at === null || run.score_ms === null) return null;
  const ahead = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM speed_run
     WHERE day_index = ? AND finished_at IS NOT NULL AND is_replay = 0
       AND (score_ms < ? OR (score_ms = ? AND finished_at < ?))`,
  )
    .bind(input.dayIndex, run.score_ms, run.score_ms, run.finished_at)
    .first<{ n: number }>();
  return { scoreMs: run.score_ms, rank: (ahead?.n ?? 0) + 1 };
}

export interface SpeedHistoryEntry {
  dayIndex: number;
  isReplay: boolean;
  /** Left unfinished past the time cap: no score, never ranked. */
  dnf: boolean;
  durationMs: number;
  wrongCount: number;
  scoreMs: number;
  /** Ladder rank; null for a replay or a DNF, which are never ranked. */
  rank: number | null;
}

interface HistoryRow {
  dayIndex: number;
  isReplay: number;
  finishedAt: number | null;
  durationMs: number | null;
  wrongCount: number | null;
  scoreMs: number | null;
  rank: number | null;
}

/** Every finished or timed-out run (ranked and replay) of the caller, for the history page. */
export async function getSpeedHistory(input: { anonId: string }): Promise<SpeedHistoryEntry[]> {
  const who = await identify(input.anonId);
  const column = who.userId ? "user_id" : "anon_id";
  const { results } = await env.DB.prepare(
    `SELECT r.day_index AS dayIndex, r.is_replay AS isReplay, r.finished_at AS finishedAt,
            r.duration_ms AS durationMs, r.wrong_count AS wrongCount, r.score_ms AS scoreMs,
            CASE WHEN r.is_replay = 0 AND r.finished_at IS NOT NULL THEN
              (SELECT COUNT(*) FROM speed_run o
               WHERE o.day_index = r.day_index AND o.is_replay = 0 AND o.finished_at IS NOT NULL
                 AND (o.score_ms < r.score_ms OR (o.score_ms = r.score_ms AND o.finished_at < r.finished_at))) + 1
            END AS rank
     FROM speed_run r
     WHERE r.${column} = ? AND (r.finished_at IS NOT NULL OR r.started_at < ?)`,
  )
    .bind(who.userId ?? who.anonId, Date.now() - SPEED_MAX_RUN_MS)
    .all<HistoryRow>();
  return results.map(({ finishedAt, ...r }) => ({
    dayIndex: r.dayIndex,
    isReplay: r.isReplay === 1,
    dnf: finishedAt === null,
    durationMs: r.durationMs ?? 0,
    wrongCount: r.wrongCount ?? 0,
    scoreMs: r.scoreMs ?? 0,
    rank: r.rank,
  }));
}
