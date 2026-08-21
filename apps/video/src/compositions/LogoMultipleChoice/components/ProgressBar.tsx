import { Audio, interpolate, interpolateColors, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../../lib/theme";
import { REVEAL_TRANSITION_FRAMES } from "../constants";

// Frames (counting down from revealAt) at which a tick sound plays, one per second remaining.
function getTickFrames(revealAt: number, fps: number): number[] {
    const frames: number[] = [];
    for (let k = 1; revealAt - k * fps > 0; k++) {
        frames.push(revealAt - k * fps);
    }
    return frames;
}

export const ProgressBar = ({ revealAt }: { revealAt: number }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

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

    const urgentColor = interpolateColors(progress, [0.6, 1], [theme.colors.accentPink, theme.colors.danger]);

    const revealed = frame >= revealAt;
    const secondsLeft = Math.max(0, Math.ceil((revealAt - frame) / fps));
    const tickFrames = getTickFrames(revealAt, fps);

    return (
        <>
            {tickFrames.map((tickFrame) => (
                <Sequence key={tickFrame} from={tickFrame} layout="none">
                    <Audio src={staticFile("sounds/tick.wav")} volume={0.3} />
                </Sequence>
            ))}
            {!revealed && (
                <div
                    style={{
                        position: "absolute",
                        bottom: 128,
                        fontSize: 56,
                        fontWeight: 700,
                        color: urgentColor,
                        opacity: barOpacity,
                    }}
                >
                    {secondsLeft}
                </div>
            )}
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
                        backgroundColor: urgentColor,
                    }}
                />
            </div>
        </>)
};