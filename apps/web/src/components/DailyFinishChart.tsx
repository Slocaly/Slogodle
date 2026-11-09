import { useMemo } from "react";
import { Chart } from "@tanstack/react-charts";
import { barY, colorLegend, defineChart, stack } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import type { DailyFinishStat } from "../lib/stats";
import styles from "./DailyFinishChart.module.css";
import {
  BUCKET_ORDER,
  BUCKET_COLORS_DARK,
  BUCKET_COLORS_LIGHT,
} from "./chartBuckets";
import type { Bucket } from "./chartBuckets";

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
    if (stat.tries1) rows.push({ bucket: "1 try", count: stat.tries1, label });
    if (stat.tries2)
      rows.push({ bucket: "2 tries", count: stat.tries2, label });
    if (stat.tries3)
      rows.push({ bucket: "3 tries", count: stat.tries3, label });
    if (stat.historic)
      rows.push({ bucket: "Historic", count: stat.historic, label });
    if (stat.failed) rows.push({ bucket: "Failed", count: stat.failed, label });
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
    const colors = dark ? BUCKET_COLORS_DARK : BUCKET_COLORS_LIGHT;
    const rows = toRows(stats);
    // Fixed (not inferred) domain: days with zero finishes have no rows, but
    // must still occupy a labeled slot on the axis instead of being skipped.
    const labels = stats.map(labelFor);
    return defineChart({
      marks: [
        barY(rows, {
          color: "bucket",
          layout: stack({ order: [...BUCKET_ORDER] }),
          x: "label",
          y: "count",
        }),
      ],
      scales: {
        x: {
          axis: {
            label: "Day of month",
            ticks: { spacing: 24 },
          },
          scale: scaleBand<string>().domain(labels).padding(0.25),
        },
        y: {
          axis: { label: "Players" },
          grid: true,
          nice: true,
          scale: scaleLinear,
        },
      },

      color: {
        domain: [...BUCKET_ORDER],
        legend: colorLegend({ label: "Result" }),
        range: BUCKET_ORDER.map((bucket) => colors[bucket]),
      },

      // One tooltip per bar: group every stacked segment sharing the same day.
      focus: "group-x",
      maxFocusDistance: Number.POSITIVE_INFINITY,
      tooltip: {
        anchor: "group-center",
        className: styles.tooltip,
        content: (points) => {
          const total = points.reduce((sum, p) => sum + p.datum.count, 0);
          return {
            title: `Day ${points[0]?.datum.label ?? ""}`,
            rows: [
              ...points.map((p) => ({
                label: p.datum.bucket,
                value: String(p.datum.count),
                color: p.color,
              })),
              { label: "Total", value: String(total) },
            ],
          };
        },
        sort: "color-domain",
        use: tooltip,
      },
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
