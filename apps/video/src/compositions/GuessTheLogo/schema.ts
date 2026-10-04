import { z } from "zod";
import { VIDEO_LOGOS } from "../../lib/videoLogos";
import { MUSIC_TRACKS } from "../../lib/videoOrder";

const logoNames = VIDEO_LOGOS.map((logo) => logo.name) as [string, ...string[]];

export const GuessTheLogoSchema = z.object({
  logoName: z.enum(logoNames),
  revealDelayInFrames: z.number().int().min(30).default(135),
  /** Path under public/music/, e.g. "music/track.mp3". Always plays — looped, ducked around the reveal. */
  musicSrc: z.enum(MUSIC_TRACKS),
  debugSafeZones: z.boolean().optional(),
});

export type GuessTheLogoProps = z.infer<typeof GuessTheLogoSchema>;
export type LogoName = (typeof logoNames)[number];
