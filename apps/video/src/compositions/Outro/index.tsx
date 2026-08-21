import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../lib/theme";

export const OUTRO_FRAMES = 90;

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            fontSize: 130,
            fontWeight: 700,
            color: theme.colors.accentPink,
          }}
        >
          Slogodle
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 500,
            color: theme.colors.muted,
          }}
        >
          Logo games every day
        </div>
      </div>
    </AbsoluteFill>
  );
};
