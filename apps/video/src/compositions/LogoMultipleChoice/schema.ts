import { z } from "zod";

export const LogoMultipleChoiceSchema = z.object({
  targetLogoName: z.string(),
  decoyLogoNames: z.array(z.string()).min(1),
});

export type LogoMultipleChoiceProps = z.infer<typeof LogoMultipleChoiceSchema>;
