import { Html5Audio, interpolate, staticFile, spring, useCurrentFrame, useVideoConfig, Sequence, Img } from "remotion";
import { CARD_SIZE, CHOICE_STAGGER_FRAMES, LOSER_FADE_FRAMES, REVEAL_TRANSITION_FRAMES, WINNER_CENTER_Y_OFFSET, WINNER_MOVE_FRAMES, WINNER_SCALE, WINNER_Z_INDEX } from "../constants";
import { getCardCenter } from "../utils/get-card-center";
import { Logo } from "@slogodle/logos";
import { theme } from "../../../lib/theme";
import { resolveLogoIcon } from "../../../lib/pickLogos";

export const ChoiceCard = ({ index, choice, target, revealAt, choicesLength }: { index: number; choice: Logo; target: Logo; revealAt: number; choicesLength: number }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const revealed = frame >= revealAt;

    const appearAt = index * CHOICE_STAGGER_FRAMES;
    const entranceScale = Math.max(
        spring({ frame: frame - appearAt, fps, config: { damping: 12 } }),
        0,
    );
    const isCorrect = choice.name === target.name;
    const { x: gridX, y: gridY } = getCardCenter(index, choicesLength);

    const revealProgress = interpolate(
        frame,
        [revealAt, revealAt + REVEAL_TRANSITION_FRAMES],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const fadeOutOpacity = interpolate(
        frame,
        [revealAt, revealAt + LOSER_FADE_FRAMES],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const popScale = revealed
        ? spring({
            frame: frame - revealAt,
            fps,
            config: { damping: 10, stiffness: 140 },
            durationInFrames: REVEAL_TRANSITION_FRAMES,
        })
        : 0;

    const moveProgress = revealed
        ? spring({
            frame: frame - revealAt,
            fps,
            config: { damping: 16 },
            durationInFrames: WINNER_MOVE_FRAMES,
        })
        : 0;

    const opacity = revealed ? (isCorrect ? 1 : fadeOutOpacity) : 1;
    const x = isCorrect ? interpolate(moveProgress, [0, 1], [gridX, 0]) : gridX;
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
                    transform: `translate(${x - CARD_SIZE / 2}px, ${y - CARD_SIZE / 2}px) scale(${entranceScale * winnerScale * (1 + popScale * 0.06)})`,
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
}