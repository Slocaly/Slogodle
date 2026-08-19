import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LOGOS, type Logo } from "@slogodle/logos";
import { theme } from "../../lib/theme";
import { resolveLogoIcon } from "../../lib/pickLogos";
import type { GuessTheLogoProps } from "./schema";

export const REVEAL_SCENE_FRAMES = 90;
const REVEAL_POP_FRAMES = 12;

export const GuessTheLogo: React.FC<GuessTheLogoProps> = ({
  logoName,
  revealDelayInFrames,
  musicSrc,
}) => {
  const logo = LOGOS.find((candidate) => candidate.name === logoName);

  if (!logo) {
    throw new Error(`Unknown logo: ${logoName}`);
  }

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 12% 18%, ${theme.colors.bg3} 0%, transparent 42%),
          radial-gradient(circle at 88% 12%, ${theme.colors.bg2} 0%, transparent 48%),
          radial-gradient(circle at 50% 95%, ${theme.colors.bg1} 0%, transparent 55%),
          ${theme.colors.bg1}`,
        fontFamily: theme.fontFamily,
      }}
    >
      {musicSrc && <Audio src={staticFile(musicSrc)} volume={0.25} loop />}
      <GuessScene logo={logo} revealDelayInFrames={revealDelayInFrames} />
    </AbsoluteFill>
  );
};

function getTickFrames(revealDelayInFrames: number, fps: number): number[] {
  const frames: number[] = [];
  for (let k = 1; revealDelayInFrames - k * fps > 0; k++) {
    frames.push(revealDelayInFrames - k * fps);
  }
  return frames;
}

const GuessScene: React.FC<{ logo: Logo; revealDelayInFrames: number }> = ({
  logo,
  revealDelayInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealed = frame >= revealDelayInFrames;
  const secondsLeft = Math.max(1, Math.ceil((revealDelayInFrames - frame) / fps));

  const titleScale = spring({ frame, fps, config: { damping: 12 } });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoScale = spring({ frame, fps, config: { damping: 12 } });

  const countdownOpacity = interpolate(
    frame,
    [revealDelayInFrames, revealDelayInFrames + REVEAL_POP_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const drainProgress = interpolate(frame, [0, revealDelayInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nameOpacity = interpolate(
    frame,
    [revealDelayInFrames + 15, revealDelayInFrames + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const tickFrames = getTickFrames(revealDelayInFrames, fps);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {tickFrames.map((tickFrame) => (
        <Sequence key={tickFrame} from={tickFrame} layout="none">
          <Audio src={staticFile("sounds/click.wav")} />
        </Sequence>
      ))}
      <Sequence from={revealDelayInFrames} layout="none">
        <Audio src={staticFile("sounds/confirm.wav")} />
      </Sequence>
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 120,
          fontWeight: 700,
          color: theme.colors.text,
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        Guess the logo!
      </div>
      <Img
        src={staticFile(resolveLogoIcon(logo.icon))}
        style={{
          width: 560,
          height: 560,
          objectFit: "contain",
          transform: `scale(${logoScale})`,
        }}
      />
      {!revealed && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            width: "80%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            opacity: countdownOpacity,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: theme.colors.accentPink,
            }}
          >
            {secondsLeft}
          </div>
          <div
            style={{
              width: "100%",
              height: 28,
              borderRadius: 999,
              backgroundColor: theme.colors.border,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(1 - drainProgress) * 100}%`,
                height: "100%",
                borderRadius: 999,
                backgroundColor: theme.colors.accentPink,
              }}
            />
          </div>
        </div>
      )}
      {revealed && (
        <div
          style={{
            position: "absolute",
            bottom: 140,
            width: "100%",
            textAlign: "center",
            fontSize: 110,
            fontWeight: 700,
            color: theme.colors.accentPink,
            opacity: nameOpacity,
          }}
        >
          {logo.name}
        </div>
      )}
    </AbsoluteFill>
  );
};
