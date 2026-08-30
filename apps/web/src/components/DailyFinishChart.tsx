import { useMemo } from "react";
import { Chart } from "@tanstack/react-charts";
import { barY, colorLegend, defineChart, stack } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import type { DailyFinishStat } from "../lib/stats";

const BUCKET_ORDER = ["1 try", "2 tries", "3 tries", "Failed"] as const;
type Bucket = (typeof BUCKET_ORDER)[number];

// Mirrors --success, --accent-yellow, --accent-lavender, --danger from
// global.css: SVG fill attributes don't reliably resolve CSS custom
// properties, so the light/dark values are duplicated here instead.
const COLORS_LIGHT: Record<Bucket, string> = {
  "1 try": "oklch(0.56 0.15 155)",
  "2 tries": "oklch(0.87 0.13 95)",
  "3 tries": "oklch(0.8 0.1 300)",
  Failed: "oklch(0.6 0.19 15)",
};

const COLORS_DARK: Record<Bucket, string> = {
  "1 try": "oklch(0.65 0.14 155)",
  "2 tries": "oklch(0.78 0.13 95)",
  "3 tries": "oklch(0.68 0.1 300)",
  Failed: "oklch(0.65 0.18 20)",
};

interface FinishRow {
  label: string;
  bucket: Bucket;
  count: number;
}

function labelFor(stat: DailyFinishStat): string {
  return String(new Date(`${stat.date}T00:00:00`).getDate());
}

function toRows(stats: readonly DailyFinishStat[]): FinishRow[] {
  const rows: FinishRow[] = [];
  for (const stat of stats) {
    const label = labelFor(stat);
    if (stat.tries1) rows.push({ label, bucket: "1 try", count: stat.tries1 });
    if (stat.tries2) rows.push({ label, bucket: "2 tries", count: stat.tries2 });
    if (stat.tries3) rows.push({ label, bucket: "3 tries", count: stat.tries3 });
    if (stat.failed) rows.push({ label, bucket: "Failed", count: stat.failed });
  }
  return rows;
}

export function DailyFinishChart({
  stats,
  dark,
}: {
  stats: readonly DailyFinishStat[];
  dark: boolean;
}) {
  const definition = useMemo(() => {
    const colors = dark ? COLORS_DARK : COLORS_LIGHT;
    const rows = toRows(stats);
    // Fixed (not inferred) domain: days with zero finishes have no rows, but
    // must still occupy a labeled slot on the axis instead of being skipped.
    const labels = stats.map(labelFor);
    return defineChart({
      marks: [
        barY(rows, {
          x: "label",
          y: "count",
          color: "bucket",
          layout: stack({ order: [...BUCKET_ORDER] }),
        }),
      ],
      scales: {
        x: {
          scale: scaleBand<string>().domain(labels).padding(0.25),
          axis: {
            ticks: { spacing: 24 },
            label: "Day of month",
          },
        },
        y: {
          scale: scaleLinear,
          nice: true,
          grid: true,
          axis: { label: "Players" },
        },
      },

      color: {
        domain: [...BUCKET_ORDER],
        range: BUCKET_ORDER.map((bucket) => colors[bucket]),
        legend: colorLegend({ label: "Result" }),
      },

      tooltip,
    });
  }, [stats, dark]);

  return (
    <Chart
      definition={definition}
      height={360}
      ariaLabel="Players who finished each day, grouped by number of tries"
    />
  );
}
