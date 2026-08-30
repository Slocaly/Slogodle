import { env } from "cloudflare:workers";
import { dayIndexFor } from "./game-logic";

export type FinishBucket = "tries1" | "tries2" | "tries3" | "failed";

export interface DailyFinishStat {
  dayIndex: number;
  date: string;
  tries1: number;
  tries2: number;
  tries3: number;
  failed: number;
}

interface FinishCountRow {
  day_index: number;
  status: "won" | "lost";
  guess_count: number;
  count: number;
}

type Counts = Pick<DailyFinishStat, "tries1" | "tries2" | "tries3" | "failed">;

function emptyCounts(): Counts {
  return { tries1: 0, tries2: 0, tries3: 0, failed: 0 };
}

function isoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function bucketFor(row: FinishCountRow): FinishBucket | null {
  if (row.status === "lost") return "failed";
  if (row.guess_count === 1) return "tries1";
  if (row.guess_count === 2) return "tries2";
  if (row.guess_count === 3) return "tries3";
  return null;
}

// `month` is 0-indexed (0 = January), matching JS Date's convention.
export async function dailyFinishStats(
  year: number,
  month: number,
): Promise<DailyFinishStat[]> {
  const monthStart = new Date(year, month, 1);
  const nextMonthStart = new Date(year, month + 1, 1);
  const startDayIndex = dayIndexFor(monthStart);
  const endDayIndex = dayIndexFor(nextMonthStart) - 1;

  const { results } = await env.DB.prepare(
    `SELECT day_index, status, guess_count, COUNT(*) as count
     FROM progress
     WHERE day_index BETWEEN ? AND ? AND status IN ('won', 'lost')
     GROUP BY day_index, status, guess_count`,
  )
    .bind(startDayIndex, endDayIndex)
    .all<FinishCountRow>();

  const byDay = new Map<number, Counts>();
  for (const row of results) {
    const bucket = bucketFor(row);
    if (!bucket) continue;
    const counts = byDay.get(row.day_index) ?? emptyCounts();
    counts[bucket] += row.count;
    byDay.set(row.day_index, counts);
  }

  const stats: DailyFinishStat[] = [];
  for (
    let d = new Date(monthStart);
    d < nextMonthStart;
    d.setDate(d.getDate() + 1)
  ) {
    const dayIndex = dayIndexFor(d);
    stats.push({
      dayIndex,
      date: isoDate(d),
      ...(byDay.get(dayIndex) ?? emptyCounts()),
    });
  }

  return stats;
}
