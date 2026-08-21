import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  interpolateColors,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LOGOS, type Logo } from "@slogodle/logos";
import { theme } from "../../lib/theme";
import { useAnimatedGradientBackground } from "../../lib/animatedGradientBackground";
import { resolveLogoIcon } from "../../lib/pickLogos";
import { Outro, OUTRO_FRAMES } from "../Outro";
import type { GuessTheLogoProps } from "./schema";

export const REVEAL_SCENE_FRAMES = 90;
const REVEAL_POP_FRAMES = 12;
const OUTRO_TRANSITION_FRAMES = 20;
const NAME_DELAY_FRAMES = 20;
const NAME_FADE_FRAMES = 15;
const DESCRIPTION_DELAY_FRAMES = 35;
const DESCRIPTION_FADE_FRAMES = 15;

export const GuessTheLogo: React.FC<GuessTheLogoProps> = ({
  logoName,
  revealDelayInFrames,
  musicSrc,
}) => {
  const logo = LOGOS.find((candidate) => candidate.name === logoName);

  if (!logo) {
    throw new Error(`Unknown logo: ${logoName}`);
  }

  const background = useAnimatedGradientBackground();

  return (
    <AbsoluteFill
      style={{
        background,
        fontFamily: theme.fontFamily,
      }}
    >
      {musicSrc && <Audio src={staticFile(musicSrc)} volume={0.25} loop />}
      <Sequence name="Guess" durationInFrames={revealDelayInFrames + REVEAL_SCENE_FRAMES}>
        <GuessSceneWithFade logo={logo} revealDelayInFrames={revealDelayInFrames} />
      </Sequence>
      <Sequence
        name="Outro"
        from={revealDelayInFrames + REVEAL_SCENE_FRAMES}
        durationInFrames={OUTRO_FRAMES}
      >
        <Outro />
      </Sequence>
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

const GuessSceneWithFade: React.FC<{ logo: Logo; revealDelayInFrames: number }> = ({
  logo,
  revealDelayInFrames,
}) => {
  const frame = useCurrentFrame();
  const sceneEnd = revealDelayInFrames + REVEAL_SCENE_FRAMES;
  const contentOpacity = interpolate(
    frame,
    [sceneEnd - OUTRO_TRANSITION_FRAMES, sceneEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity: contentOpacity }}>
      <GuessScene logo={logo} revealDelayInFrames={revealDelayInFrames} />
    </AbsoluteFill>
  );
};

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

  const urgentColor = interpolateColors(
    drainProgress,
    [0.6, 1],
    [theme.colors.accentPink, theme.colors.danger],
  );

  const descriptionOpacity = interpolate(
    frame,
    [
      revealDelayInFrames + DESCRIPTION_DELAY_FRAMES,
      revealDelayInFrames + DESCRIPTION_DELAY_FRAMES + DESCRIPTION_FADE_FRAMES,
    ],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const nameOpacity = interpolate(
    frame,
    [
      revealDelayInFrames + NAME_DELAY_FRAMES,
      revealDelayInFrames + NAME_DELAY_FRAMES + NAME_FADE_FRAMES,
    ],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const tickFrames = getTickFrames(revealDelayInFrames, fps);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {tickFrames.map((tickFrame) => (
        <Sequence key={tickFrame} from={tickFrame} layout="none">
          <Audio src={staticFile("sounds/tick.wav")} volume={0.3} />
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
              color: urgentColor,
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
                backgroundColor: urgentColor,
              }}
            />
          </div>
        </div>
      )}
      {revealed && (
        <div
          style={{
            position: "absolute",
            bottom: 320,
            width: "80%",
            textAlign: "center",
            fontSize: 40,
            lineHeight: 1.5,
            fontWeight: 600,
            color: theme.colors.text,
            opacity: descriptionOpacity,
          }}
        >
          {logo.funFact}
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
