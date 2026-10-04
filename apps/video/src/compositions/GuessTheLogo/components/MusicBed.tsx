import { Html5Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { getMusicTrimFrames } from "../../../lib/videoOrder";

const BASE_VOLUME = 0.35;
const DUCK_VOLUME = 0.15;
const FADE_OUT_FRAMES = 60;

export const MusicBed: React.FC<{
    src: string;
    revealAtFrame: number;
    revealTransitionFrames: number;
}> = ({ src, revealAtFrame, revealTransitionFrames }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const duckedVolume = interpolate(
        frame,
        [
            revealAtFrame - 10,
            revealAtFrame,
            revealAtFrame + revealTransitionFrames,
            revealAtFrame + revealTransitionFrames + 15,
        ],
        [BASE_VOLUME, DUCK_VOLUME, DUCK_VOLUME, BASE_VOLUME],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const fadeOut = interpolate(
        frame,
        [durationInFrames - FADE_OUT_FRAMES, durationInFrames - 1],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return <Html5Audio trimBefore={getMusicTrimFrames(src)} src={staticFile(src)} loop volume={duckedVolume * fadeOut} />;
};
