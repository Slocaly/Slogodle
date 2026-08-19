import { z } from "zod";

export const GuessTheLogoSchema = z.object({
  logoName: z.string(),
  revealDelayInFrames: z.number().int().min(30).default(90),
  /** Path under public/music/, e.g. "music/track.mp3". Left empty until a licensed track is supplied. */
  musicSrc: z.string().optional(),
});

export type GuessTheLogoProps = z.infer<typeof GuessTheLogoSchema>;
