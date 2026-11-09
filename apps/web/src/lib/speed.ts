import type { Logo } from "@slogodle/logos";

export const SPEED_ROUND_SIZE = 5;
/** Wrong guesses before the letter count appears; each extra miss reveals one letter. */
export const SPEED_MASK_AFTER_MISSES = 3;
export const SPEED_LETTER_RE = /[\p{L}\p{N}]/u;

/** Case, hyphens, dots and spaces don't matter: "react-router" = "React Router" = "reactrouter", "Next.js" = "nextjs". */
export function normalizeAnswer(text: string): string {
  return text.toLowerCase().replace(/[-.\s]+/g, "");
}

/**
 * Accepted answers for a logo: its full name, plus the name without a
 * ".js"/".ts" or fused "JS" suffix ("Next.js" -> "next", "SolidJS" -> "solid").
 * A bare trailing "ts" is only stripped after a dot, so "Highcharts" is safe.
 */
export function isCorrectSpeedGuess(text: string, name: string): boolean {
  const guess = normalizeAnswer(text);
  const stripped = name
    .replace(/\.(js|ts)$/i, "")
    .replace(/(?<=\p{L}{2,})js$/iu, "");
  return guess === normalizeAnswer(name) || guess === normalizeAnswer(stripped);
}

export function formatTime(ms: number): string {
  const totalTenths = Math.floor(ms / 100);
  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

/** Fisher-Yates shuffle driven by `random` (defaults to Math.random). */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Small deterministic PRNG (mulberry32). */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random series, different every call (practice mode). */
export function randomSpeedLogos<T extends Logo>(bank: T[]): T[] {
  return shuffle(bank).slice(0, SPEED_ROUND_SIZE);
}

/**
 * The daily series: same five logos, in the same order, for everyone on a
 * given day. Like the main game, it depends on the bank's content and order.
 */
export function dailySpeedLogos<T extends Logo>(bank: T[], dayIndex: number): T[] {
  const random = seededRandom(Math.imul(dayIndex + 1, 0x9e3779b1) ^ 0x51ed270b);
  return shuffle(bank, random).slice(0, SPEED_ROUND_SIZE);
}

/**
 * A run still unfinished after this long (elapsed time only, miss penalties
 * excluded) counts as abandoned: it's locked as a DNF and never ranked. This
 * stops a player who left the page from coming back to an absurd clock, and
 * since the run can't be restarted, quitting to look up answers gains nothing.
 */
export const SPEED_MAX_RUN_MS = 15 * 60 * 1000;
/** Server-side leeway so a final answer typed just before the cap still saves. */
export const SPEED_FINISH_GRACE_MS = 5000;

/** Each wrong guess adds this to the final score. */
export const SPEED_MISS_PENALTY_MS = 1000;
const MAX_GUESS_LENGTH = 100;
const MAX_GUESSES_PER_LOGO = 200;

export interface SpeedResult {
  durationMs: number;
  wrongCount: number;
  /** durationMs plus the miss penalty: what the ladder ranks on. */
  scoreMs: number;
}

export function speedScore(durationMs: number, wrongCount: number): SpeedResult {
  return {
    durationMs,
    wrongCount,
    scoreMs: durationMs + wrongCount * SPEED_MISS_PENALTY_MS,
  };
}

/**
 * Validates the guesses typed for each logo (in order, one list per logo) and
 * returns the number of misses per logo, or null when they don't add up: every
 * list must end exactly on its first correct guess. The server runs this on the
 * submitted guesses, so the rules above are the single source of truth.
 */
export function checkSpeedGuesses(logos: Logo[], guesses: unknown): number[] | null {
  if (!Array.isArray(guesses) || guesses.length !== logos.length) return null;
  const misses: number[] = [];
  for (let i = 0; i < logos.length; i++) {
    const list: unknown = guesses[i];
    if (!Array.isArray(list) || list.length === 0 || list.length > MAX_GUESSES_PER_LOGO) {
      return null;
    }
    if (list.some((g) => typeof g !== "string" || g.length > MAX_GUESS_LENGTH)) {
      return null;
    }
    const firstCorrect = (list as string[]).findIndex((g) =>
      isCorrectSpeedGuess(g, logos[i].name),
    );
    if (firstCorrect !== list.length - 1) return null;
    misses.push(firstCorrect);
  }
  return misses;
}
