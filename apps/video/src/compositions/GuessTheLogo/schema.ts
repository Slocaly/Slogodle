import { z } from "zod";
import { LOGOS } from "@slogodle/logos";

const logoNames = LOGOS.map((logo) => logo.name) as [string, ...string[]];

export const GuessTheLogoSchema = z.object({
  logoName: z.enum(logoNames),
  revealDelayInFrames: z.number().int().min(30).default(150),
  /** Path under public/music/, e.g. "music/track.mp3". Always plays — looped, ducked around the reveal. */
  musicSrc: z.string(),
  debugSafeZones: z.boolean().optional(),
});

export type GuessTheLogoProps = z.infer<typeof GuessTheLogoSchema>;
export type LogoName = (typeof logoNames)[number];
