import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
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

export const QUESTION_FRAMES = 30;
const CHOICE_STAGGER_FRAMES = 10;
const CHOICES_HOLD_FRAMES = 60;
export const REVEAL_HOLD_FRAMES = 60;
const REVEAL_TRANSITION_FRAMES = 12;

export function getChoicesFrames(choiceCount: number): number {
  return CHOICE_STAGGER_FRAMES * choiceCount + CHOICES_HOLD_FRAMES;
}

function renderQuestionText(questionText: string, logoName: string): React.ReactNode {
  const index = questionText.indexOf(logoName);
  if (index === -1) {
    return questionText;
  }
  return (
    <>
      {questionText.slice(0, index).trim()}
      <br />
      <span style={{ color: theme.colors.accentPink, fontWeight: 700, fontSize: "1.4em" }}>
        {logoName}
      </span>
      <br />
      {questionText.slice(index + logoName.length).trim()}
    </>
  );
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
      style={{
        background: `radial-gradient(circle at 12% 18%, ${theme.colors.bg3} 0%, transparent 42%),
          radial-gradient(circle at 88% 12%, ${theme.colors.bg2} 0%, transparent 48%),
          radial-gradient(circle at 50% 95%, ${theme.colors.bg1} 0%, transparent 55%),
          ${theme.colors.bg1}`,
        fontFamily: theme.fontFamily,
      }}
    >
      {musicSrc && <Audio src={staticFile(musicSrc)} volume={0.25} loop />}
      <Sequence
        name="Question"
        durationInFrames={QUESTION_FRAMES + choicesFrames + REVEAL_HOLD_FRAMES}
        premountFor={30}
      >
        <QuestionTitle questionText={questionText} targetName={target.name} />
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

const QuestionTitle: React.FC<{ questionText: string; targetName: string }> = ({
  questionText,
  targetName,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          padding: "120px 80px 0",
          fontSize: 68,
          fontWeight: 600,
          color: theme.colors.text,
          textAlign: "center",
          opacity,
          transform: `scale(${scale}) translateY(${(1 - scale) * 20}px)`,
        }}
      >
        {renderQuestionText(questionText, targetName)}
      </div>
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

  const progress = interpolate(frame, [0, revealAt], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barOpacity = interpolate(
    frame,
    [revealAt, revealAt + REVEAL_TRANSITION_FRAMES],
    [1, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Sequence from={revealAt} layout="none">
        <Audio src={staticFile("sounds/confirm.wav")} />
      </Sequence>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 96,
          padding: 40,
          marginTop: 60,
        }}
      >
        {choices.map((choice, index) => {
          const appearAt = index * CHOICE_STAGGER_FRAMES;
          const scale = Math.max(
            spring({ frame: frame - appearAt, fps, config: { damping: 12 } }),
            0,
          );
          const isCorrect = choice.name === targetName;
          const revealProgress = interpolate(
            frame,
            [revealAt, revealAt + REVEAL_TRANSITION_FRAMES],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const dimOpacity = revealed && !isCorrect ? 1 - revealProgress * 0.6 : 1;
          const popScale =
            revealed && isCorrect
              ? spring({
                  frame: frame - revealAt,
                  fps,
                  config: { damping: 10, stiffness: 140 },
                  durationInFrames: REVEAL_TRANSITION_FRAMES,
                })
              : 0;

          return (
            <div key={choice.name}>
              <Sequence from={appearAt} layout="none">
                <Audio src={staticFile("sounds/click.wav")} />
              </Sequence>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 400,
                  height: 400,
                  borderRadius: 32,
                  backgroundColor: theme.colors.cardBg,
                  border: `8px solid ${theme.colors.border}`,
                  opacity: dimOpacity,
                  transform: `scale(${scale * (1 + popScale * 0.06)})`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: -8,
                    borderRadius: 32,
                    border: `8px solid ${theme.colors.success}`,
                    opacity: isCorrect ? revealProgress : 0,
                    boxShadow: `0 0 40px ${theme.colors.success}`,
                  }}
                />
                <Img
                  src={staticFile(resolveLogoIcon(choice.icon))}
                  style={{ width: 260, height: 260, objectFit: "contain" }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 80,
          width: "80%",
          height: 28,
          borderRadius: 999,
          backgroundColor: theme.colors.border,
          opacity: barOpacity,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            borderRadius: 999,
            backgroundColor: theme.colors.accentPink,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
