import {
  AbsoluteFill,
  interpolate,
  random,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { LOGOS, type Logo } from "@slogodle/logos";
import { theme } from "../../lib/theme";
import { useAnimatedGradientBackground } from "../../lib/animatedGradientBackground";
import { Outro, OUTRO_FRAMES } from "../Outro";
import type { LogoMultipleChoiceProps } from "./schema";
import { QuestionTitle } from "./components/QuestionTitle";
import { getChoicesFrames } from "./utils/get-choices-frames";
import { OUTRO_TRANSITION_FRAMES, QUESTION_FRAMES, REVEAL_HOLD_FRAMES } from "./constants";
import { ChoiceGrid } from "./components/ChoiceGrid";

function resolveLogo(name: string): Logo {
  const logo = LOGOS.find((candidate) => candidate.name === name);
  if (!logo) {
    throw new Error(`Unknown logo: ${name}`);
  }
  return logo;
}

export const LogoMultipleChoice: React.FC<LogoMultipleChoiceProps> = ({
  targetLogoName,
  decoyLogoNames,
}) => {
  const frame = useCurrentFrame();
  const target = resolveLogo(targetLogoName);
  const decoys = decoyLogoNames.map(resolveLogo);
  // Deterministic (not Math.random) so the layout stays identical across frame renders.
  const targetIndex = Math.floor(random(targetLogoName) * (decoys.length + 1));
  const choices = [...decoys.slice(0, targetIndex), target, ...decoys.slice(targetIndex)];
  const choicesFrames = getChoicesFrames(choices.length);
  const outroStart = QUESTION_FRAMES + choicesFrames + REVEAL_HOLD_FRAMES;
  const contentOpacity = interpolate(
    frame,
    [outroStart - OUTRO_TRANSITION_FRAMES, outroStart],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const background = useAnimatedGradientBackground();

  return (
    <AbsoluteFill
      style={{
        background,
        fontFamily: theme.fontFamily,
      }}
    >
      <AbsoluteFill style={{ opacity: contentOpacity }}>
        <Sequence
          name="Question"
          durationInFrames={QUESTION_FRAMES + choicesFrames + REVEAL_HOLD_FRAMES}
          premountFor={30}
        >
          <QuestionTitle targetName={target.name} />
        </Sequence>
        <Sequence
          name="Choices"
          from={QUESTION_FRAMES}
          durationInFrames={choicesFrames + REVEAL_HOLD_FRAMES}
          premountFor={30}
        >
          <ChoiceGrid choices={choices} target={target} revealAt={choicesFrames} />
        </Sequence>
      </AbsoluteFill>
      <Sequence name="Outro" from={outroStart} durationInFrames={OUTRO_FRAMES}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};

