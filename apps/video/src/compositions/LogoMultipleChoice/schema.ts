import { z } from "zod";
import { VIDEO_LOGOS } from "../../lib/videoLogos";
import { MUSIC_TRACKS } from "../../lib/videoOrder";

const logoNames = VIDEO_LOGOS.map((logo) => logo.name) as [string, ...string[]];

export const LogoMultipleChoiceSchema = z.object({
  targetLogoName: z.enum(logoNames),
  decoyLogoNames: z.array(z.enum(logoNames)).min(1),
  musicSrc: z.enum(MUSIC_TRACKS),
  debugSafeZones: z.boolean().optional(),
});

export type LogoMultipleChoiceProps = z.infer<typeof LogoMultipleChoiceSchema>;
export type LogoName = (typeof logoNames)[number];
