import { loadFont } from "@remotion/google-fonts/Fredoka";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const theme = {
  fontFamily,
  colors: {
    bg1: "oklch(0.90 0.065 320)",
    bg2: "oklch(0.93 0.075 190)",
    bg3: "oklch(0.955 0.075 80)",
    cardBg: "oklch(0.995 0.01 90)",
    text: "oklch(0.28 0.05 290)",
    muted: "oklch(0.5 0.04 290)",
    border: "oklch(0.86 0.035 300)",
    success: "oklch(0.56 0.15 155)",
    danger: "oklch(0.6 0.19 15)",
    accentPink: "oklch(0.6 0.19 350)",
    accentYellow: "oklch(0.87 0.13 95)",
    accentLavender: "oklch(0.8 0.1 300)",
  },
} as const;
