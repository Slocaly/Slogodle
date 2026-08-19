import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LOGOS, type Logo } from "@slogodle/logos";
import { theme } from "../../lib/theme";
import { resolveLogoIcon } from "../../lib/pickLogos";
import type { LogoMultipleChoiceProps } from "./schema";

export const QUESTION_FRAMES = 60;
const CHOICE_STAGGER_FRAMES = 10;
const CHOICES_HOLD_FRAMES = 60;
export const REVEAL_HOLD_FRAMES = 60;

export function getChoicesFrames(choiceCount: number): number {
  return CHOICE_STAGGER_FRAMES * choiceCount + CHOICES_HOLD_FRAMES;
}

function resolveLogo(name: string): Logo {
  const logo = LOGOS.find((candidate) => candidate.name === name);
  if (!logo) {
    throw new Error(`Unknown logo: ${name}`);
  }
  return logo;
}

export const LogoMultipleChoice: React.FC<LogoMultipleChoiceProps> = ({
  questionText,
  targetLogoName,
  decoyLogoNames,
  musicSrc,
}) => {
  const target = resolveLogo(targetLogoName);
  const decoys = decoyLogoNames.map(resolveLogo);
  const midpoint = Math.floor(decoys.length / 2);
  const choices = [...decoys.slice(0, midpoint), target, ...decoys.slice(midpoint)];
  const choicesFrames = getChoicesFrames(choices.length);

  return (
    <AbsoluteFill
      style={{ backgroundColor: theme.colors.bg2, fontFamily: theme.fontFamily }}
    >
      {musicSrc && <Audio src={staticFile(musicSrc)} volume={0.25} loop />}
      <Sequence
        name="Question"
        durationInFrames={QUESTION_FRAMES + choicesFrames + REVEAL_HOLD_FRAMES}
        premountFor={30}
      >
        <div
          style={{
            padding: "120px 80px 0",
            fontSize: 56,
            fontWeight: 600,
            color: theme.colors.text,
            textAlign: "center",
          }}
        >
          {questionText}
        </div>
      </Sequence>
      <Sequence
        name="Choices"
        from={QUESTION_FRAMES}
        durationInFrames={choicesFrames + REVEAL_HOLD_FRAMES}
        premountFor={30}
      >
        <ChoiceGrid choices={choices} targetName={target.name} revealAt={choicesFrames} />
      </Sequence>
    </AbsoluteFill>
  );
};

const ChoiceGrid: React.FC<{ choices: Logo[]; targetName: string; revealAt: number }> = ({
  choices,
  targetName,
  revealAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealed = frame >= revealAt;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Sequence from={revealAt} layout="none">
        <Audio src={staticFile("sounds/confirm.wav")} />
      </Sequence>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 40, padding: 80 }}
      >
        {choices.map((choice, index) => {
          const appearAt = index * CHOICE_STAGGER_FRAMES;
          const scale = Math.max(
            spring({ frame: frame - appearAt, fps, config: { damping: 12 } }),
            0,
          );
          const isCorrect = choice.name === targetName;

          return (
            <div key={choice.name}>
              <Sequence from={appearAt} layout="none">
                <Audio src={staticFile("sounds/click.wav")} />
              </Sequence>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 220,
                  height: 220,
                  borderRadius: 24,
                  backgroundColor: theme.colors.cardBg,
                  border: `6px solid ${
                    revealed && isCorrect ? theme.colors.success : theme.colors.border
                  }`,
                  opacity: revealed && !isCorrect ? 0.4 : 1,
                  transform: `scale(${scale})`,
                }}
              >
                <Img
                  src={staticFile(resolveLogoIcon(choice.icon))}
                  style={{ width: 140, height: 140, objectFit: "contain" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
