import { Html5Audio, interpolate, staticFile, spring, useCurrentFrame, useVideoConfig, Sequence, Img } from "remotion";
import { CARD_SIZE, LOSER_FADE_FRAMES, REVEAL_AT_FRAME, REVEAL_TRANSITION_FRAMES, SETTLE_FRAMES, WINNER_CENTER_Y_OFFSET, WINNER_MOVE_FRAMES, WINNER_SCALE, WINNER_Z_INDEX } from "../constants";
import { getCardCenter } from "../utils/get-card-center";
import { Logo } from "@slogodle/logos";
import { theme } from "../../../lib/theme";
import { resolveLogoIcon } from "../../../lib/pickLogos";

export const ChoiceCard = ({ index, choice, target, choicesLength }: { index: number; choice: Logo; target: Logo; choicesLength: number }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const revealed = frame >= REVEAL_AT_FRAME;

    // Tiny stagger inside the settle window, not a sequential pop-in — every
    // card is already visible at frame 0, this just staggers the ease-in.
    const appearAt = index * 3;
    const settle = spring({
        frame: frame - appearAt,
        fps,
        config: { damping: 14 },
        durationInFrames: SETTLE_FRAMES,
    });
    const entranceScale = 0.9 + settle * 0.1;
    const isCorrect = choice.name === target.name;
    const { x: gridX, y: gridY } = getCardCenter(index, choicesLength);

    const revealProgress = interpolate(
        frame,
        [REVEAL_AT_FRAME, REVEAL_AT_FRAME + REVEAL_TRANSITION_FRAMES],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const fadeOutOpacity = interpolate(
        frame,
        [REVEAL_AT_FRAME, REVEAL_AT_FRAME + LOSER_FADE_FRAMES],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const popScale = revealed
        ? spring({
            frame: frame - REVEAL_AT_FRAME,
            fps,
            config: { damping: 7, stiffness: 160 },
            durationInFrames: REVEAL_TRANSITION_FRAMES,
        })
        : 0;

    const moveProgress = revealed
        ? spring({
            frame: frame - REVEAL_AT_FRAME,
            fps,
            config: { damping: 16 },
            durationInFrames: WINNER_MOVE_FRAMES,
        })
        : 0;

    // Wrong cards get a brief shake + red flash before they fade.
    const shakeProgress = !isCorrect && revealed
        ? interpolate(
            frame,
            [REVEAL_AT_FRAME, REVEAL_AT_FRAME + REVEAL_TRANSITION_FRAMES],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
        : 0;
    const shakeX = shakeProgress > 0
        ? Math.sin(shakeProgress * Math.PI * 6) * (1 - shakeProgress) * 10
        : 0;
    const wrongFlash = !isCorrect && revealed
        ? interpolate(
            frame,
            [REVEAL_AT_FRAME, REVEAL_AT_FRAME + 5, REVEAL_AT_FRAME + REVEAL_TRANSITION_FRAMES],
            [0, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
        : 0;

    const opacity = revealed ? (isCorrect ? 1 : fadeOutOpacity) : 1;
    const x = isCorrect ? interpolate(moveProgress, [0, 1], [gridX, 0]) : gridX + shakeX;
    const y = isCorrect
        ? interpolate(moveProgress, [0, 1], [gridY, WINNER_CENTER_Y_OFFSET])
        : gridY;
    const winnerScale = isCorrect
        ? interpolate(moveProgress, [0, 1], [1, WINNER_SCALE])
        : 1;

    return (
        <div key={choice.name}>
            <Sequence from={appearAt} layout="none">
                <Html5Audio src={staticFile("sounds/click.wav")} />
            </Sequence>
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: CARD_SIZE,
                    height: CARD_SIZE,
                    borderRadius: 32,
                    backgroundColor: theme.colors.cardBg,
                    border: `8px solid ${theme.colors.border}`,
                    opacity,
                    zIndex: isCorrect ? WINNER_Z_INDEX : undefined,
                    transform: `translate(${x - CARD_SIZE / 2}px, ${y - CARD_SIZE / 2}px) scale(${entranceScale * winnerScale * (1 + popScale * (isCorrect ? 0.1 : 0.04))})`,
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
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 32,
                        border: `8px solid ${theme.colors.danger}`,
                        backgroundColor: theme.colors.danger,
                        opacity: wrongFlash * 0.5,
                    }}
                />
                <Img
                    src={staticFile(resolveLogoIcon(choice.icon))}
                    style={{ width: 260, height: 260, objectFit: "contain" }}
                />
            </div>
        </div>
    );
}