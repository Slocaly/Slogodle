import { useMemo } from "react";
import { Chart } from "@tanstack/react-charts";
import { barY, defineChart } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { BUCKET_ORDER, BUCKET_COLORS_DARK, BUCKET_COLORS_LIGHT, type Bucket } from "./chartBuckets";

interface CountRow {
  bucket: Bucket;
  count: number;
}

export function WinsByTriesChart({
  counts,
  dark,
}: {
  counts: Record<Bucket, number>;
  dark: boolean;
}) {
  const definition = useMemo(() => {
    const colors = dark ? BUCKET_COLORS_DARK : BUCKET_COLORS_LIGHT;
    const rows: CountRow[] = BUCKET_ORDER.map((bucket) => ({ bucket, count: counts[bucket] }));
    return defineChart({
      marks: [
        barY(rows, {
          x: "bucket",
          y: "count",
          color: "bucket",
        }),
      ],
      scales: {
        x: {
          scale: scaleBand<string>().domain([...BUCKET_ORDER]).padding(0.35),
        },
        y: {
          scale: scaleLinear,
          nice: true,
          grid: true,
          axis: { label: "Days" },
        },
      },
      color: {
        domain: [...BUCKET_ORDER],
        range: BUCKET_ORDER.map((bucket) => colors[bucket]),
      },
      tooltip,
    });
  }, [counts, dark]);

  return (
    <Chart
      definition={definition}
      height={280}
      ariaLabel="Number of days won by number of tries, days won late via the archive, and days lost"
    />
  );
}
