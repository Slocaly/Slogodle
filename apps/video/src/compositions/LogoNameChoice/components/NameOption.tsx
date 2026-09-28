import { Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../../lib/theme";
import {
  LOSER_FADE_FRAMES,
  OPTION_BADGE_SIZE,
  OPTION_GAP,
  OPTION_HEIGHT,
  OPTION_LETTERS,
  OPTION_STAGGER_FRAMES,
  OPTION_WIDTH,
  OPTIONS_TOP,
  REVEAL_TRANSITION_FRAMES,
  SETTLE_FRAMES,
  WINNER_HOLD_FRAMES,
  WINNER_TOP,
} from "../constants";

function getNameFontSize(name: string): number {
  if (name.length > 18) return 40;
  if (name.length > 14) return 46;
  return 54;
}

export const NameOption: React.FC<{
  index: number;
  name: string;
  isCorrect: boolean;
  revealAtFrame: number;
}> = ({ index, name, isCorrect, revealAtFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealed = frame >= revealAtFrame;

  // Tiny stagger inside the settle window, not a sequential pop-in — every
  // option is already visible at frame 0, this just staggers the ease-in.
  const appearAt = index * OPTION_STAGGER_FRAMES;
  const settle = spring({
    frame: frame - appearAt,
    fps,
    config: { damping: 14 },
    durationInFrames: SETTLE_FRAMES,
  });
  const entranceScale = 0.9 + settle * 0.1;

  const revealProgress = interpolate(
    frame,
    [revealAtFrame, revealAtFrame + REVEAL_TRANSITION_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const popScale = revealed
    ? spring({
        frame: frame - revealAtFrame,
        fps,
        config: { damping: 7, stiffness: 160 },
        durationInFrames: REVEAL_TRANSITION_FRAMES,
      })
    : 0;

  // Wrong options get a brief shake + red flash before they fade.
  const shakeX = !isCorrect && revealed
    ? Math.sin(revealProgress * Math.PI * 6) * (1 - revealProgress) * 10
    : 0;
  const wrongFlash = !isCorrect && revealed
    ? interpolate(
        frame,
        [revealAtFrame, revealAtFrame + 5, revealAtFrame + REVEAL_TRANSITION_FRAMES],
        [0, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;

  const loserOpacity = interpolate(
    frame,
    [revealAtFrame, revealAtFrame + LOSER_FADE_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = isCorrect ? 1 : loserOpacity;

  // The correct option holds its green highlight in place for a beat, then
  // slides up under the logo and stays there as the answer's name. Slightly
  // underdamped so it overshoots a touch (~5%) and settles back into place.
  const moveProgress = isCorrect && frame >= revealAtFrame + WINNER_HOLD_FRAMES
    ? spring({
        frame: frame - revealAtFrame - WINNER_HOLD_FRAMES,
        fps,
        config: { damping: 15, stiffness: 120 },
      })
    : 0;

  const accentColor = isCorrect && revealed ? theme.colors.success : theme.colors.accentPink;
  const scale = entranceScale * (1 + popScale * (isCorrect ? 0.08 : 0.03));
  const slotTop = OPTIONS_TOP + index * (OPTION_HEIGHT + OPTION_GAP);
  const top = interpolate(moveProgress, [0, 1], [slotTop, WINNER_TOP]);

  return (
    <>
      <Sequence from={appearAt} layout="none">
        <Html5Audio src={staticFile("sounds/click.wav")} />
      </Sequence>
      <div
        style={{
          position: "absolute",
          top,
          left: `calc(50% - ${OPTION_WIDTH / 2}px)`,
          width: OPTION_WIDTH,
          height: OPTION_HEIGHT,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 28,
          padding: `0 32px 0 ${(OPTION_HEIGHT - OPTION_BADGE_SIZE) / 2}px`,
          borderRadius: OPTION_HEIGHT / 2,
          backgroundColor: theme.colors.cardBg,
          border: `6px solid ${theme.colors.border}`,
          opacity,
          zIndex: isCorrect ? 1 : undefined,
          transform: `translateX(${shakeX}px) scale(${scale})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: OPTION_HEIGHT / 2,
            border: `6px solid ${theme.colors.success}`,
            opacity: isCorrect ? revealProgress : 0,
            boxShadow: `0 0 40px ${theme.colors.success}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: OPTION_HEIGHT / 2,
            backgroundColor: theme.colors.danger,
            opacity: wrongFlash * 0.5,
          }}
        />
        <div
          style={{
            flexShrink: 0,
            width: OPTION_BADGE_SIZE,
            height: OPTION_BADGE_SIZE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            backgroundColor: accentColor,
            color: theme.colors.cardBg,
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          {OPTION_LETTERS[index]}
        </div>
        <div
          style={{
            flex: 1,
            fontSize: getNameFontSize(name),
            fontWeight: 600,
            color: theme.colors.text,
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
      </div>
    </>
  );
};
