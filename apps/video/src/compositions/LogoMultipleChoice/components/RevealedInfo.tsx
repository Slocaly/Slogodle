import { Logo } from "@slogodle/logos"
import { theme } from "../../../lib/theme"
import { CARD_SIZE, DESCRIPTION_DELAY_FRAMES, DESCRIPTION_FADE_FRAMES, NAME_DELAY_FRAMES, NAME_FADE_FRAMES, WINNER_CENTER_Y_OFFSET, WINNER_SCALE } from "../constants"
import { interpolate, useCurrentFrame } from "remotion";

export const RevealedInfo = ({ target, revealAt }: { target: Logo; revealAt: number }) => {
    const frame = useCurrentFrame();
    const revealed = frame >= revealAt;

    if (!revealed) {
        return null;
    }

    const descriptionOpacity = interpolate(
        frame,
        [
            revealAt + DESCRIPTION_DELAY_FRAMES,
            revealAt + DESCRIPTION_DELAY_FRAMES + DESCRIPTION_FADE_FRAMES,
        ],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const nameOpacity = interpolate(
        frame,
        [revealAt + NAME_DELAY_FRAMES, revealAt + NAME_DELAY_FRAMES + NAME_FADE_FRAMES],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

    return (
        <>
            <div
                style={{
                    position: "absolute",
                    top: `calc(50% + ${WINNER_CENTER_Y_OFFSET + (CARD_SIZE * WINNER_SCALE) / 2 + 140}px)`,
                    width: "80%",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        fontSize: 40,
                        lineHeight: 1.5,
                        fontWeight: 600,
                        color: theme.colors.text,
                        opacity: descriptionOpacity,
                    }}
                >
                    {target.description}
                </div>
            </div>
            <div
                style={{
                    position: "absolute",
                    bottom: '140px',
                    fontSize: target.name.length > 16 ? 100 : target.name.length > 13 ? 120 : 164,
                    fontWeight: 700,
                    color: theme.colors.accentPink,
                    opacity: nameOpacity,
                }}
            >
                {target.name}
            </div>
        </>
    );
}