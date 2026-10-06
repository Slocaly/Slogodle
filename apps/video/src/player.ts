// Entry point for embedding the compositions in @remotion/player (the web admin).
// Mirrors the Composition settings in Root.tsx.
import type { ComponentType } from "react";
import { GuessTheLogo } from "./compositions/GuessTheLogo";
import { REVEAL_SCENE_FRAMES } from "./compositions/GuessTheLogo/constants";
import { LogoMultipleChoice } from "./compositions/LogoMultipleChoice/LogoMultipleChoice";
import { TOTAL_FRAMES } from "./compositions/LogoMultipleChoice/constants";
import {
  LogoNameChoice,
  REVEAL_SCENE_FRAMES as NAME_CHOICE_REVEAL_SCENE_FRAMES,
} from "./compositions/LogoNameChoice";
import { OUTRO_FRAMES } from "./compositions/Outro";
import type { CompositionId } from "./lib/videoSeries";

export interface PlayerComposition {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  fps: number;
  width: number;
  height: number;
  durationInFrames: (inputProps: Record<string, unknown>) => number;
}

const revealDelay = (inputProps: Record<string, unknown>) =>
  typeof inputProps.revealDelayInFrames === "number" ? inputProps.revealDelayInFrames : 135;

export const PLAYER_COMPOSITIONS: Record<CompositionId, PlayerComposition> = {
  GuessTheLogo: {
    component: GuessTheLogo,
    fps: 30,
    width: 1080,
    height: 1920,
    durationInFrames: (inputProps) => revealDelay(inputProps) + REVEAL_SCENE_FRAMES + OUTRO_FRAMES,
  },
  LogoMultipleChoice: {
    component: LogoMultipleChoice,
    fps: 30,
    width: 1080,
    height: 1920,
    durationInFrames: () => TOTAL_FRAMES,
  },
  LogoNameChoice: {
    component: LogoNameChoice,
    fps: 30,
    width: 1080,
    height: 1920,
    durationInFrames: (inputProps) =>
      revealDelay(inputProps) + NAME_CHOICE_REVEAL_SCENE_FRAMES + OUTRO_FRAMES,
  },
};
