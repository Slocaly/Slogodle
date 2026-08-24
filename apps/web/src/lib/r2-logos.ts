import { createServerFn } from "@tanstack/react-start";
import { listR2Logos } from "./r2-logos.server";

export type { R2Logo } from "./r2-logos.server";

export const fetchR2Logos = createServerFn({ method: "GET" }).handler(() =>
  listR2Logos(),
);
