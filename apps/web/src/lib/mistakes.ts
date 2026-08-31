import { createServerFn } from "@tanstack/react-start";
import { topMistakesByLogo } from "./mistakes.server";
import { requireAdmin } from "./session.server";

export type { LogoMistakeStat } from "./mistakes.server";

export const fetchTopMistakes = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return topMistakesByLogo();
});
