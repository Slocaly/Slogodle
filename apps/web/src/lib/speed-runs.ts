import { createServerFn } from "@tanstack/react-start";
import {
  finishSpeedRun as finishSpeedRunDb,
  getSpeedLadder,
  getSpeedRun as getSpeedRunDb,
  getSpeedStanding,
  startSpeedRun as startSpeedRunDb,
} from "./speed.server";
import type { SpeedResult } from "./speed";

export type { LadderEntry } from "./speed.server";

export type SpeedRunState =
  | { status: "none"; serverNow: number }
  | { status: "running"; startedAt: number; serverNow: number }
  | { status: "finished"; startedAt: number; serverNow: number; result: SpeedResult };

interface RunInput {
  anonId: string;
  dayIndex: number;
}

export const fetchSpeedRun = createServerFn({ method: "POST" })
  .validator((input: RunInput) => input)
  .handler(({ data }) => getSpeedRunDb(data));

export const startSpeedRun = createServerFn({ method: "POST" })
  .validator((input: RunInput) => input)
  .handler(({ data }) => startSpeedRunDb(data));

export const finishSpeedRun = createServerFn({ method: "POST" })
  .validator((input: RunInput & { guesses: string[][] }) => input)
  .handler(({ data }) => finishSpeedRunDb(data));

export const fetchSpeedLadder = createServerFn({ method: "GET" })
  .validator((input: { dayIndex: number }) => input)
  .handler(({ data }) => getSpeedLadder(data));

export const fetchSpeedStanding = createServerFn({ method: "POST" })
  .validator((input: RunInput) => input)
  .handler(({ data }) => getSpeedStanding(data));
