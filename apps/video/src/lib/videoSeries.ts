import {
  buildGuessTheLogoEpisodes,
  buildMultipleChoiceEpisodes,
  buildNameChoiceEpisodes,
} from "./videoOrder";

// Kept free of composition imports so node scripts (render-all) can use it too.

export type SeriesName = "multiple-choice" | "name-choice" | "guess";

export type CompositionId = "LogoMultipleChoice" | "LogoNameChoice" | "GuessTheLogo";

export interface SeriesEpisode {
  name: string;
  label: string;
  inputProps: Record<string, unknown>;
}

export interface Series {
  compositionId: CompositionId;
  episodes: SeriesEpisode[];
}

export const SERIES: Record<SeriesName, () => Series> = {
  "multiple-choice": () => ({
    compositionId: "LogoMultipleChoice",
    episodes: buildMultipleChoiceEpisodes().map((episode) => ({
      name: episode.targetLogoName,
      label: `${episode.targetLogoName}  (decoys: ${episode.decoyLogoNames.join(", ")})`,
      inputProps: { ...episode },
    })),
  }),
  "name-choice": () => ({
    compositionId: "LogoNameChoice",
    episodes: buildNameChoiceEpisodes().map((episode) => ({
      name: episode.targetLogoName,
      label: `${episode.targetLogoName}  (decoys: ${episode.decoyLogoNames.join(", ")})`,
      inputProps: { ...episode, revealDelayInFrames: 135 },
    })),
  }),
  guess: () => ({
    compositionId: "GuessTheLogo",
    episodes: buildGuessTheLogoEpisodes().map((episode) => ({
      name: episode.logoName,
      label: episode.logoName,
      inputProps: { ...episode, revealDelayInFrames: 135 },
    })),
  }),
};

/** One video goes out per day, cycling through the series in this order. */
export const PUBLISH_ORDER: SeriesName[] = ["multiple-choice", "guess", "name-choice"];

/** Local date of the first published video (month is 0-based). */
export const PUBLISH_START_DATE = new Date(2026, 9, 5);

export interface ScheduledVideo {
  date: Date;
  series: SeriesName;
  compositionId: CompositionId;
  /** 1-based, matches the file numbering in out/<series>/. */
  episodeNumber: number;
  episode: SeriesEpisode;
}

/** Every video in publishing order, one per day from PUBLISH_START_DATE. */
export function buildPublishSchedule(): ScheduledVideo[] {
  const series = PUBLISH_ORDER.map((name) => ({ name, ...SERIES[name]() }));
  const rounds = Math.max(...series.map((s) => s.episodes.length));
  const schedule: ScheduledVideo[] = [];

  for (let round = 0; round < rounds; round++) {
    for (const { name, compositionId, episodes } of series) {
      const episode = episodes[round];
      if (!episode) continue;
      const date = new Date(PUBLISH_START_DATE);
      date.setDate(date.getDate() + schedule.length);
      schedule.push({ date, series: name, compositionId, episodeNumber: round + 1, episode });
    }
  }

  return schedule;
}
