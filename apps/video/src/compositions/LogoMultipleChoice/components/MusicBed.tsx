import { Html5Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { REVEAL_AT_FRAME, REVEAL_TRANSITION_FRAMES } from "../constants";

const BASE_VOLUME = 0.35;
const DUCK_VOLUME = 0.15;

export const MusicBed: React.FC<{ src: string }> = ({ src }) => {
    const frame = useCurrentFrame();
    const volume = interpolate(
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
    return <Html5Audio trimBefore={493} src={staticFile(src)} loop volume={volume} />;
};
