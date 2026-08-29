import { z } from "zod";
import { LOGOS } from "@slogodle/logos";

const logoNames = LOGOS.map((logo) => logo.name) as [string, ...string[]];

export const LogoMultipleChoiceSchema = z.object({
  targetLogoName: z.enum(logoNames),
  decoyLogoNames: z.array(z.enum(logoNames)).min(1),
  musicSrc: z.string(),
  debugSafeZones: z.boolean().optional(),
});

export type LogoMultipleChoiceProps = z.infer<typeof LogoMultipleChoiceSchema>;
export type LogoName = (typeof logoNames)[number];
