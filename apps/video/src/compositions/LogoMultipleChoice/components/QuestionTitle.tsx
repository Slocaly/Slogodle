import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../../lib/theme";
import { REVEAL_AT_FRAME, REVEAL_TRANSITION_FRAMES, SETTLE_FRAMES } from "../constants";

export const QuestionTitle = ({
    targetName,

}: { targetName: string }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    // Settle only — the title is already fully visible at frame 0, this just
    // eases it in from a slightly smaller/lower resting position.
    const settle = spring({ frame, fps, config: { damping: 14 }, durationInFrames: SETTLE_FRAMES });
    const entranceScale = 0.94 + settle * 0.06;

    // Fully disappears once the answer is revealed, freeing the whole frame
    // for the correct logo/description.
    const revealShrink = interpolate(
        frame,
        [REVEAL_AT_FRAME, REVEAL_AT_FRAME + REVEAL_TRANSITION_FRAMES],
        [1, 0.55],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const revealOpacity = interpolate(
        frame,
        [REVEAL_AT_FRAME, REVEAL_AT_FRAME + REVEAL_TRANSITION_FRAMES],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const topPadding = interpolate(
        frame,
        [REVEAL_AT_FRAME, REVEAL_AT_FRAME + REVEAL_TRANSITION_FRAMES],
        [120, 48],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

    return (
        <AbsoluteFill style={{ alignItems: "center" }}>
            <div
                style={{
                    padding: `${topPadding}px 80px 0`,
                    fontSize: 68,
                    fontWeight: 600,
                    color: theme.colors.text,
                    textAlign: "center",
                    opacity: revealOpacity,
                    transform: `scale(${entranceScale * revealShrink}) translateY(${(1 - settle) * 12}px)`,
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
