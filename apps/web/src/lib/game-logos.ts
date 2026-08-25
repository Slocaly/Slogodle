import { createServerFn } from "@tanstack/react-start";
import { listGameLogos } from "./game-logos.server";

export const fetchGameLogos = createServerFn({ method: "GET" }).handler(() =>
  listGameLogos(),
);
