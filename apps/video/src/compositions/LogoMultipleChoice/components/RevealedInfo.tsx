import { Logo } from "@slogodle/logos"
import { theme } from "../../../lib/theme"
import { DESCRIPTION_DELAY_FRAMES, DESCRIPTION_FADE_FRAMES, FUN_FACT_DELAY_FRAMES, FUN_FACT_FADE_FRAMES, NAME_BOTTOM_OFFSET, NAME_DELAY_FRAMES, NAME_FADE_FRAMES, REVEAL_AT_FRAME, REVEAL_INFO_GAP } from "../constants"
import { interpolate, useCurrentFrame } from "remotion";

export const RevealedInfo = ({ target }: { target: Logo }) => {
    const frame = useCurrentFrame();
    const revealed = frame >= REVEAL_AT_FRAME;

    if (!revealed) {
        return null;
    }

    const descriptionOpacity = interpolate(
        frame,
        [
            REVEAL_AT_FRAME + DESCRIPTION_DELAY_FRAMES,
            REVEAL_AT_FRAME + DESCRIPTION_DELAY_FRAMES + DESCRIPTION_FADE_FRAMES,
        ],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const nameOpacity = interpolate(
        frame,
        [REVEAL_AT_FRAME + NAME_DELAY_FRAMES, REVEAL_AT_FRAME + NAME_DELAY_FRAMES + NAME_FADE_FRAMES],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const funFactProgress = interpolate(
        frame,
        [REVEAL_AT_FRAME + FUN_FACT_DELAY_FRAMES, REVEAL_AT_FRAME + FUN_FACT_DELAY_FRAMES + FUN_FACT_FADE_FRAMES],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

    return (
        // Stacked in one bottom-anchored column so a long description or fun
        // fact pushes upwards instead of overlapping the name.
        <div
            style={{
                position: "absolute",
                bottom: NAME_BOTTOM_OFFSET,
                width: "80%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: REVEAL_INFO_GAP,
                textAlign: "center",
            }}
        >
            <div
                style={{
                    fontSize: 36,
                    lineHeight: 1.4,
                    fontWeight: 600,
                    color: theme.colors.text,
                    opacity: descriptionOpacity,
                }}
            >
                {target.description}
            </div>
            <div
                style={{
                    width: "100%",
                    padding: "24px 32px",
                    boxSizing: "border-box",
                    backgroundColor: theme.colors.cardBg,
                    border: `4px solid ${theme.colors.accentLavender}`,
                    borderRadius: 32,
                    boxShadow: `0 8px 32px ${theme.colors.accentLavender}55`,
                    opacity: funFactProgress,
                    transform: `translateY(${(1 - funFactProgress) * 20}px)`,
                }}
            >
                <div
                    style={{
                        fontSize: 30,
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: theme.colors.accentPink,
                        marginBottom: 8,
                    }}
                >
                    💡 Fun fact
                </div>
                <div
                    style={{
                        fontSize: 30,
                        lineHeight: 1.35,
                        fontWeight: 500,
                        color: theme.colors.muted,
                    }}
                >
                    {target.funFact}
                </div>
            </div>
            <div
                style={{
                    fontSize: target.name.length > 16 ? 80 : target.name.length > 13 ? 96 : 110,
                    lineHeight: 1,
                    fontWeight: 700,
                    color: theme.colors.accentPink,
                    opacity: nameOpacity,
                }}
            >
                {target.name}
            </div>
        </div>
    );
}
