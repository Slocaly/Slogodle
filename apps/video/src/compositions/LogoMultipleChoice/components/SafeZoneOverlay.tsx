import { AbsoluteFill, useVideoConfig } from "remotion";

export const SafeZoneOverlay: React.FC = () => {
    const { width, height } = useVideoConfig();
    const bottomBandHeight = height * 0.2;
    const rightBandWidth = width * 0.15;
    const bandStyle: React.CSSProperties = {
        position: "absolute",
        background: "oklch(0.6 0.2 25 / 0.25)",
        border: "2px dashed oklch(0.6 0.2 25)",
        zIndex: 99999,
        pointerEvents: "none",
    };
    return (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
            <div style={{ ...bandStyle, left: 0, right: 0, bottom: 0, height: bottomBandHeight }} />
            <div style={{ ...bandStyle, top: 0, bottom: 0, right: 0, width: rightBandWidth }} />
        </AbsoluteFill>
    );
};
