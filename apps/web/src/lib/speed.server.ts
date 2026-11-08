import { getRequestHeaders } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { getAuth } from "./auth.server";
import { listGameLogos } from "./game-logos.server";
import { dayIndexFor } from "./game-logic";
import { checkSpeedGuesses, dailySpeedLogos, speedScore } from "./speed";
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

function assertPlayableDay(dayIndex: unknown): asserts dayIndex is number {
  if (!Number.isInteger(dayIndex)) throw new Error("invalid day");
  if (Math.abs((dayIndex as number) - dayIndexFor(new Date())) > TIMEZONE_SLACK_DAYS) {
    throw new Error("day not playable");
  }
}

async function findRun(who: Identity, dayIndex: number): Promise<SpeedRunRow | null> {
  const column = who.userId ? "user_id" : "anon_id";
  return env.DB.prepare(
    `SELECT id, started_at, finished_at, duration_ms, wrong_count, score_ms
     FROM speed_run WHERE ${column} = ? AND day_index = ?`,
  )
    .bind(who.userId ?? who.anonId, dayIndex)
    .first<SpeedRunRow>();
}

function toState(row: SpeedRunRow | null): SpeedRunState {
  const serverNow = Date.now();
  if (!row) return { status: "none", serverNow };
  if (row.finished_at === null) {
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

export async function getSpeedRun(input: { anonId: string; dayIndex: number }) {
  assertPlayableDay(input.dayIndex);
  const who = await identify(input.anonId);
  return toState(await findRun(who, input.dayIndex));
}

/** Idempotent: a second call (reload, other device) returns the existing run. */
export async function startSpeedRun(input: { anonId: string; dayIndex: number }) {
  assertPlayableDay(input.dayIndex);
  const who = await identify(input.anonId);
  await env.DB.prepare(
    `INSERT OR IGNORE INTO speed_run (anon_id, user_id, day_index, started_at) VALUES (?, ?, ?, ?)`,
  )
    .bind(who.anonId, who.userId, input.dayIndex, Date.now())
    .run();
  return toState(await findRun(who, input.dayIndex));
}

export async function finishSpeedRun(input: {
  anonId: string;
  dayIndex: number;
  guesses: string[][];
}) {
  assertPlayableDay(input.dayIndex);
  const who = await identify(input.anonId);
  const run = await findRun(who, input.dayIndex);
  if (!run) throw new Error("run not started");
  if (run.finished_at !== null) return toState(run);

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

  return toState(await findRun(who, input.dayIndex));
}

export interface LadderEntry {
  name: string;
  durationMs: number;
  wrongCount: number;
  scoreMs: number;
  isMe: boolean;
}

/** Day ladder: accounts only (anonymous runs are stored but not ranked). */
export async function getSpeedLadder(input: { dayIndex: number }): Promise<LadderEntry[]> {
  if (!Number.isInteger(input.dayIndex)) throw new Error("invalid day");
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
  const { results } = await env.DB.prepare(
    `SELECT u.name AS name, r.duration_ms AS durationMs, r.wrong_count AS wrongCount, r.score_ms AS scoreMs,
            (r.user_id = ?) AS isMe
     FROM speed_run r JOIN user u ON u.id = r.user_id
     WHERE r.day_index = ? AND r.finished_at IS NOT NULL
     ORDER BY r.score_ms ASC, r.finished_at ASC
     LIMIT 50`,
  )
    .bind(session?.user?.id ?? "", input.dayIndex)
    .all<Omit<LadderEntry, "isMe"> & { isMe: number }>();
  return results.map((r) => ({ ...r, isMe: r.isMe === 1 }));
}

export interface SpeedStanding {
  scoreMs: number;
  /** Rank on the day ladder; null for anonymous runs (not ranked). */
  rank: number | null;
}

/** The caller's finished run for the day, or null if they haven't finished one. */
export async function getSpeedStanding(input: {
  anonId: string;
  dayIndex: number;
}): Promise<SpeedStanding | null> {
  assertPlayableDay(input.dayIndex);
  const who = await identify(input.anonId);
  const run = await findRun(who, input.dayIndex);
  if (!run || run.finished_at === null || run.score_ms === null) return null;
  if (!who.userId) return { scoreMs: run.score_ms, rank: null };
  const ahead = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM speed_run
     WHERE day_index = ? AND finished_at IS NOT NULL AND user_id IS NOT NULL
       AND (score_ms < ? OR (score_ms = ? AND finished_at < ?))`,
  )
    .bind(input.dayIndex, run.score_ms, run.score_ms, run.finished_at)
    .first<{ n: number }>();
  return { scoreMs: run.score_ms, rank: (ahead?.n ?? 0) + 1 };
}
