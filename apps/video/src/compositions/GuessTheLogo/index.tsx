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
      style={{ backgroundColor: theme.colors.bg1, fontFamily: theme.fontFamily }}
    >
      {musicSrc && <Audio src={staticFile(musicSrc)} volume={0.25} loop />}
      <Sequence
        name="Question"
        durationInFrames={revealDelayInFrames}
        premountFor={30}
      >
        <QuestionScene logo={logo} revealDelayInFrames={revealDelayInFrames} />
      </Sequence>
      <Sequence name="Reveal" from={revealDelayInFrames} premountFor={30}>
        <RevealScene logo={logo} />
      </Sequence>
    </AbsoluteFill>
  );
};

const QuestionScene: React.FC<{ logo: Logo; revealDelayInFrames: number }> = ({
  logo,
  revealDelayInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const secondsLeft = Math.max(1, Math.ceil((revealDelayInFrames - frame) / fps));

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{ fontSize: 64, fontWeight: 600, color: theme.colors.text, marginBottom: 60 }}
      >
        Guess the logo!
      </div>
      <Img
        src={staticFile(resolveLogoIcon(logo.icon))}
        style={{
          width: 320,
          height: 320,
          objectFit: "contain",
          filter: "blur(24px) brightness(0.9)",
        }}
      />
      <div
        style={{ fontSize: 96, fontWeight: 700, color: theme.colors.accentPink, marginTop: 60 }}
      >
        {secondsLeft}
      </div>
    </AbsoluteFill>
  );
};

const RevealScene: React.FC<{ logo: Logo }> = ({ logo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const nameOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Audio src={staticFile("sounds/confirm.wav")} />
      <Img
        src={staticFile(resolveLogoIcon(logo.icon))}
        style={{ width: 320, height: 320, objectFit: "contain", transform: `scale(${scale})` }}
      />
      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          color: theme.colors.success,
          marginTop: 60,
          opacity: nameOpacity,
        }}
      >
        {logo.name}
      </div>
    </AbsoluteFill>
  );
};
