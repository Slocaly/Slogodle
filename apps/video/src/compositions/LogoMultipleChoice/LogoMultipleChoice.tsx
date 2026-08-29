import { AbsoluteFill, interpolate, random, Sequence, useCurrentFrame } from "remotion";
import { LOGOS, type Logo } from "@slogodle/logos";
import { theme } from "../../lib/theme";
import { useAnimatedGradientBackground } from "../../lib/animatedGradientBackground";
import type { LogoMultipleChoiceProps } from "./schema";
import { QuestionTitle } from "./components/QuestionTitle";
import { ChoiceGrid } from "./components/ChoiceGrid";
import { MusicBed } from "./components/MusicBed";
import { Outro } from "../Outro";
import { OUTRO_BEAT_FRAMES, OUTRO_START_FRAME, OUTRO_TRANSITION_FRAMES } from "./constants";
import { SafeZoneOverlay } from "./components/SafeZoneOverlay";

function resolveLogo(name: string): Logo {
  const logo = LOGOS.find((candidate) => candidate.name === name);
  if (!logo) {
    throw new Error(`Unknown logo: ${name}`);
  }
  return logo;
}

export const LogoMultipleChoice: React.FC<LogoMultipleChoiceProps> = ({
  targetLogoName,
  decoyLogoNames,
  musicSrc,
  debugSafeZones,
}) => {
  const frame = useCurrentFrame();
  const target = resolveLogo(targetLogoName);
  const decoys = decoyLogoNames.map(resolveLogo);
  // Deterministic (not Math.random) so the layout stays identical across frame renders.
  const targetIndex = Math.floor(random(targetLogoName) * (decoys.length + 1));
  const choices = [...decoys.slice(0, targetIndex), target, ...decoys.slice(targetIndex)];
  const background = useAnimatedGradientBackground();
  const contentOpacity = interpolate(
    frame,
    [OUTRO_START_FRAME - OUTRO_TRANSITION_FRAMES, OUTRO_START_FRAME],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background,
        fontFamily: theme.fontFamily,
      }}
    >
      <MusicBed src={musicSrc} />
      <AbsoluteFill style={{ opacity: contentOpacity }}>
        <QuestionTitle targetName={target.name} />
        <ChoiceGrid choices={choices} target={target} />
      </AbsoluteFill>
      <Sequence name="Outro" from={OUTRO_START_FRAME} durationInFrames={OUTRO_BEAT_FRAMES}>
        <Outro />
      </Sequence>
      {debugSafeZones && <SafeZoneOverlay />}
    </AbsoluteFill>
  );
};
