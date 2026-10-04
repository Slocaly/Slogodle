import { random } from "remotion";
import { LOGOS, type Logo } from "@slogodle/logos";

// Changing this reshuffles the whole video series. It only needs to differ from
// the web game's day order, which comes from `logo_metadata.day_order` / LOGOS order.
export const VIDEO_ORDER_SEED = "slogodle-videos-v1";

export const MUSIC_TRACKS = [
  "music/HoliznaCC0 - Break From Reality.mp3",
  "music/HoliznaCC0 - Tetrapod.mp3",
  "music/HoliznaCC0 - The Best Of Times.mp3",
] as const;

export type MusicTrack = (typeof MUSIC_TRACKS)[number];

// Frames skipped at the start of each track (30fps), so the music starts on a good part.
const DEFAULT_MUSIC_TRIM_FRAMES = 493;
const MUSIC_TRIM_FRAMES: Partial<Record<string, number>> = {
  "music/HoliznaCC0 - Tetrapod.mp3": 505,
};

export function getMusicTrimFrames(src: string): number {
  return MUSIC_TRIM_FRAMES[src] ?? DEFAULT_MUSIC_TRIM_FRAMES;
}

export interface MultipleChoiceEpisode {
  targetLogoName: string;
  decoyLogoNames: string[];
  musicSrc: MusicTrack;
}

export type NameChoiceEpisode = MultipleChoiceEpisode;

export interface GuessTheLogoEpisode {
  logoName: string;
  musicSrc: MusicTrack;
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random(`${seed}-${i}`) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function buildChoiceEpisodes(logos: Logo[], decoyCount: number, seed: string, musicOffset: number) {
  return seededShuffle(logos, seed).map((target, index) => {
    const others = logos.filter((logo) => logo.name !== target.name);
    const decoys = seededShuffle(others, `${seed}-${target.name}`).slice(0, decoyCount);
    return {
      targetLogoName: target.name,
      decoyLogoNames: decoys.map((logo) => logo.name),
      musicSrc: MUSIC_TRACKS[(index + musicOffset) % MUSIC_TRACKS.length],
    };
  });
}

// Each series gets its own order (and a shifted music rotation) so the same logo
// doesn't come up on the same day across series.

/** One episode per logo, in a deterministic order unrelated to the web game's. */
export function buildMultipleChoiceEpisodes(
  logos: Logo[] = LOGOS,
  decoyCount = 3,
): MultipleChoiceEpisode[] {
  return buildChoiceEpisodes(logos, decoyCount, VIDEO_ORDER_SEED, 0);
}

export function buildNameChoiceEpisodes(
  logos: Logo[] = LOGOS,
  decoyCount = 3,
): NameChoiceEpisode[] {
  return buildChoiceEpisodes(logos, decoyCount, `${VIDEO_ORDER_SEED}-name-choice`, 1);
}

export function buildGuessTheLogoEpisodes(logos: Logo[] = LOGOS): GuessTheLogoEpisode[] {
  return seededShuffle(logos, `${VIDEO_ORDER_SEED}-guess`).map((logo, index) => ({
    logoName: logo.name,
    musicSrc: MUSIC_TRACKS[(index + 2) % MUSIC_TRACKS.length],
  }));
}
