import { Html5Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { getMusicTrimFrames } from "../../../lib/videoOrder";
import { REVEAL_AT_FRAME, REVEAL_TRANSITION_FRAMES } from "../constants";

const BASE_VOLUME = 0.35;
const DUCK_VOLUME = 0.15;
const FADE_OUT_FRAMES = 60;

export const MusicBed: React.FC<{ src: string }> = ({ src }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const duckedVolume = interpolate(
        frame,
        [
            REVEAL_AT_FRAME - 10,
            REVEAL_AT_FRAME,
            REVEAL_AT_FRAME + REVEAL_TRANSITION_FRAMES,
            REVEAL_AT_FRAME + REVEAL_TRANSITION_FRAMES + 15,
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
