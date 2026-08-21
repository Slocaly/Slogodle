import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../../lib/theme";

export const QuestionTitle = ({
    targetName,

}: { targetName: string }) => {
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
                Which of these is the
                <br />
                <span style={{ color: theme.colors.accentPink, fontWeight: 700, fontSize: "1.4em" }}>
                    {targetName}
                </span>
                <br />
                logo?
            </div>
        </AbsoluteFill>
    );
};