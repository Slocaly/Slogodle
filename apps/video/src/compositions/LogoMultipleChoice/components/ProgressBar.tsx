import { Audio, interpolate, interpolateColors, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../../lib/theme";
import {
    COUNTDOWN_BADGE_SIZE,
    COUNTDOWN_BAR_WIDTH_RATIO,
    COUNTDOWN_BOTTOM_OFFSET,
    COUNTDOWN_FONT_SIZE,
    REVEAL_AT_FRAME,
    REVEAL_TRANSITION_FRAMES,
    SETTLE_FRAMES,
} from "../constants";

// Frames (counting down from REVEAL_AT_FRAME) at which a tick sound plays, one per second remaining.
function getTickFrames(fps: number): number[] {
    const frames: number[] = [];
    for (let k = 1; REVEAL_AT_FRAME - k * fps > SETTLE_FRAMES; k++) {
        frames.push(REVEAL_AT_FRAME - k * fps);
    }
    return frames;
}

export const ProgressBar = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const progress = interpolate(frame, [SETTLE_FRAMES, REVEAL_AT_FRAME], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const barOpacity = interpolate(
        frame,
        [REVEAL_AT_FRAME, REVEAL_AT_FRAME + REVEAL_TRANSITION_FRAMES],
        [1, 0.3],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

    const urgentColor = interpolateColors(progress, [0.6, 1], [theme.colors.accentPink, theme.colors.danger]);

    const revealed = frame >= REVEAL_AT_FRAME;
    const secondsLeft = Math.max(0, Math.ceil((REVEAL_AT_FRAME - frame) / fps));
    const tickFrames = getTickFrames(fps);

    return (
        <>
            {tickFrames.map((tickFrame) => (
                <Sequence key={tickFrame} from={tickFrame} layout="none">
                    <Audio src={staticFile("sounds/tick.wav")} volume={0.3} />
                </Sequence>
            ))}
            <div
                style={{
                    position: "absolute",
                    bottom: COUNTDOWN_BOTTOM_OFFSET,
                    left: 0,
                    right: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 40,
                }}
            >
                {!revealed && (
                    <div
                        style={{
                            width: COUNTDOWN_BADGE_SIZE,
                            height: COUNTDOWN_BADGE_SIZE,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: COUNTDOWN_FONT_SIZE,
                            lineHeight: 1,
                            fontWeight: 800,
                            color: urgentColor,
                            opacity: barOpacity,
                            backgroundColor: theme.colors.cardBg,
                            border: `6px solid ${urgentColor}`,
                            borderRadius: "50%",
                            boxShadow: `0 8px 32px ${urgentColor}55`,
                        }}
                    >
                        {secondsLeft}
                    </div>
                )}
                <div
                    style={{
                        width: `${COUNTDOWN_BAR_WIDTH_RATIO * 100}%`,
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
                            backgroundColor: urgentColor,
                        }}
                    />
                </div>
            </div>
        </>)
};
