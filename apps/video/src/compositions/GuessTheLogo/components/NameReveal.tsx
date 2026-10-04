import { interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "../../../lib/theme";
import { NAME_PILL_HEIGHT, REVEAL_TRANSITION_FRAMES } from "../constants";

function getNameFontSize(name: string): number {
  if (name.length > 16) return 72;
  if (name.length > 13) return 84;
  return 96;
}

/**
 * The answer pops in on the reveal frame inside a pill that lights up with the
 * same green "correct" border + glow as the winning card / option in the other
 * videos. `frame` is relative to the reveal (0 = reveal frame).
 */
export const NameReveal: React.FC<{ name: string; frame: number }> = ({ name, frame }) => {
  const { fps } = useVideoConfig();

  // Same overshoot pop as the winning answer in LogoMultipleChoice / LogoNameChoice.
  const pop = spring({
    frame,
    fps,
    config: { damping: 7, stiffness: 160 },
    durationInFrames: REVEAL_TRANSITION_FRAMES,
  });
  const scale = interpolate(pop, [0, 1], [0.6, 1]);
  const opacity = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const highlight = interpolate(frame, [0, REVEAL_TRANSITION_FRAMES], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        height: NAME_PILL_HEIGHT,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        padding: "0 56px",
        borderRadius: NAME_PILL_HEIGHT / 2,
        backgroundColor: theme.colors.cardBg,
        border: `6px solid ${theme.colors.border}`,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -6,
          borderRadius: NAME_PILL_HEIGHT / 2,
          border: `6px solid ${theme.colors.success}`,
          boxShadow: `0 0 40px ${theme.colors.success}`,
          opacity: highlight,
        }}
      />
      <div
        style={{
          fontSize: getNameFontSize(name),
          lineHeight: 1,
          fontWeight: 700,
          color: theme.colors.accentPink,
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
    </div>
  );
};
