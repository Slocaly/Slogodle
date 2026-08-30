import { createServerFn } from "@tanstack/react-start";
import { dailyFinishStats } from "./stats.server";
import { requireAdmin } from "./session.server";

export type { DailyFinishStat } from "./stats.server";

export interface FetchDailyFinishStatsInput {
  year: number;
  month: number;
}

export const fetchDailyFinishStats = createServerFn({ method: "GET" })
  .validator((input: FetchDailyFinishStatsInput) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    return dailyFinishStats(data.year, data.month);
  });
