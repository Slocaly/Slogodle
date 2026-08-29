import { Html5Audio, interpolate, staticFile, useCurrentFrame } from "remotion";

const BASE_VOLUME = 0.35;
const DUCK_VOLUME = 0.15;

export const MusicBed: React.FC<{
    src: string;
    revealAtFrame: number;
    revealTransitionFrames: number;
}> = ({ src, revealAtFrame, revealTransitionFrames }) => {
    const frame = useCurrentFrame();
    const volume = interpolate(
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
    return <Html5Audio src={staticFile(src)} loop volume={volume} />;
};
