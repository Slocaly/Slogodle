import { AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { LOGOS } from "@slogodle/logos";
import { resolveLogoIcon } from "../../lib/pickLogos";

const LOGO_COUNT = 25;
const SIZE_RANGE: [number, number] = [80, 160];
const OPACITY_RANGE: [number, number] = [0.04, 0.18];
const SPEED_RANGE: [number, number] = [15, 40];
const ROTATION_SPEED_RANGE: [number, number] = [0.3, 1.5];
const SWAY_AMPLITUDE_RANGE: [number, number] = [15, 60];
const SWAY_FREQUENCY_RANGE: [number, number] = [0.02, 0.05];
const SWAY2_AMPLITUDE_RANGE: [number, number] = [8, 25];
const SWAY2_FREQUENCY_RANGE: [number, number] = [0.05, 0.13];
const VERTICAL_WOBBLE_AMPLITUDE_RANGE: [number, number] = [6, 18];
const VERTICAL_WOBBLE_FREQUENCY_RANGE: [number, number] = [0.03, 0.08];
const SIDE_MARGIN_RATIO = 0.3;
const DRIFT_RANGE_RATIO: [number, number] = [0, 0.4];
const START_HEIGHT_ABOVE_RATIO = 1.2;

function randomInRange(seed: string, [min, max]: [number, number]): number {
  return min + random(seed) * (max - min);
}

export const FallingLogos: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: LOGO_COUNT }, (_, i) => {
        const seed = `falling-logo-${i}`;
        const logo = LOGOS[Math.floor(random(`${seed}-pick`) * LOGOS.length)];
        const size = randomInRange(`${seed}-size`, SIZE_RANGE);
        const opacity = randomInRange(`${seed}-opacity`, OPACITY_RANGE);
        const speed = randomInRange(`${seed}-speed`, SPEED_RANGE);
        const rotationSpeed = randomInRange(`${seed}-rotation-speed`, ROTATION_SPEED_RANGE);
        const rotationDirection = random(`${seed}-rotation-direction`) < 0.5 ? -1 : 1;
        const startAngle = random(`${seed}-start-angle`) * 360;
        const sideMargin = width * SIDE_MARGIN_RATIO;
        const startX = random(`${seed}-x`) * (width + sideMargin * 2) - sideMargin;
        const startY = -size - random(`${seed}-start-y`) * height * START_HEIGHT_ABOVE_RATIO;
        const driftMagnitude = randomInRange(`${seed}-drift`, DRIFT_RANGE_RATIO) * width;
        const driftDirection = startX < width / 2 ? 1 : -1;
        const driftSpeed = (driftDirection * driftMagnitude * speed) / height;
        const swayAmplitude = randomInRange(`${seed}-sway-amplitude`, SWAY_AMPLITUDE_RANGE);
        const swayFrequency = randomInRange(`${seed}-sway-frequency`, SWAY_FREQUENCY_RANGE);
        const swayPhase = random(`${seed}-sway-phase`) * Math.PI * 2;
        const sway2Amplitude = randomInRange(`${seed}-sway2-amplitude`, SWAY2_AMPLITUDE_RANGE);
        const sway2Frequency = randomInRange(`${seed}-sway2-frequency`, SWAY2_FREQUENCY_RANGE);
        const sway2Phase = random(`${seed}-sway2-phase`) * Math.PI * 2;
        const wobbleAmplitude = randomInRange(`${seed}-wobble-amplitude`, VERTICAL_WOBBLE_AMPLITUDE_RANGE);
        const wobbleFrequency = randomInRange(`${seed}-wobble-frequency`, VERTICAL_WOBBLE_FREQUENCY_RANGE);
        const wobblePhase = random(`${seed}-wobble-phase`) * Math.PI * 2;

        const y =
          startY + frame * speed + Math.sin(frame * wobbleFrequency + wobblePhase) * wobbleAmplitude;
        const x =
          startX +
          frame * driftSpeed +
          Math.sin(frame * swayFrequency + swayPhase) * swayAmplitude +
          Math.sin(frame * sway2Frequency + sway2Phase) * sway2Amplitude;
        const rotation = startAngle + frame * rotationSpeed * rotationDirection;

        return (
          <Img
            key={i}
            src={staticFile(resolveLogoIcon(logo.icon))}
            style={{
              position: "absolute",
              top: y,
              left: x,
              width: size,
              height: size,
              objectFit: "contain",
              opacity,
              transform: `rotate(${rotation}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
