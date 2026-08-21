import { useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";

type Blob = {
  color: string;
  baseX: number;
  baseY: number;
  radius: number;
  periodInSeconds: number;
  phase: number;
  amplitude: number;
};

const BLOBS: Blob[] = [
  { color: theme.colors.bg3, baseX: 12, baseY: 18, radius: 38, periodInSeconds: 5, phase: 0, amplitude: 26 },
  { color: theme.colors.bg2, baseX: 88, baseY: 12, radius: 42, periodInSeconds: 6.5, phase: 2, amplitude: 24 },
  { color: theme.colors.bg1, baseX: 50, baseY: 90, radius: 44, periodInSeconds: 8, phase: 4, amplitude: 20 },
  { color: theme.colors.bg3, baseX: 25, baseY: 88, radius: 36, periodInSeconds: 6, phase: 5, amplitude: 20 },
];

export const useAnimatedGradientBackground = (): string => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const layers = BLOBS.map(({ color, baseX, baseY, radius, periodInSeconds, phase, amplitude }) => {
    const angle = (t / periodInSeconds) * 2 * Math.PI + phase;
    const x = baseX + Math.cos(angle) * amplitude;
    const y = baseY + Math.sin(angle) * amplitude;
    return `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, transparent ${radius}%)`;
  });

  return `${layers.join(",\n          ")},\n          ${theme.colors.bg1}`;
};
