import { z } from "zod";

export const LogoMultipleChoiceSchema = z.object({
  questionText: z.string(),
  targetLogoName: z.string(),
  decoyLogoNames: z.array(z.string()).min(1),
  /** Path under public/music/, e.g. "music/track.mp3". Left empty until a licensed track is supplied. */
  musicSrc: z.string().optional(),
});

export type LogoMultipleChoiceProps = z.infer<typeof LogoMultipleChoiceSchema>;
