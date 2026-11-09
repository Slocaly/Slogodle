import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { LOGOS } from "@slogodle/logos";
import { buildPublishSchedule } from "video/schedule";
import type { ScheduledVideo, SeriesName } from "video/schedule";
import { now } from "../lib/clock";
import styles from "./admin.module.css";

// The compositions resolve staticFile() against this base, which serves apps/video/public.
const VideoPreview = lazy(() => {
  window.remotion_staticBase = "/video-assets";
  return import("../components/VideoPreview");
});

export const Route = createFileRoute("/admin/videos")({
  component: AdminVideosPage,
});

const SERIES_LABELS: Record<SeriesName, string> = {
  guess: "Guess the logo",
  "multiple-choice": "Multiple choice",
  "name-choice": "Name choice",
};

const SERIES_FILTERS = [
  "all",
  "multiple-choice",
  "guess",
  "name-choice",
] as const;

const seriesFilterParser =
  parseAsStringLiteral(SERIES_FILTERS).withDefault("all");

const schedule = buildPublishSchedule();

const iconByName = new Map(LOGOS.map((logo) => [logo.name, logo.icon]));

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    weekday: "short",
    year: "numeric",
  });
}

/** Whole calendar days from `from` to `to`, ignoring the time of day. */
function daysBetween(from: Date, to: Date): number {
  const utcDay = (date: Date) =>
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((utcDay(to) - utcDay(from)) / 86_400_000);
}

function dayOffsetLabel(offset: number): string {
  if (offset === 0) return "Today";
  return offset > 0 ? `+${offset}d` : `${offset}d`;
}

function musicLabel(musicSrc: unknown): string {
  if (typeof musicSrc !== "string") return "—";
  return musicSrc.replace(/^music\/(HoliznaCC0 - )?/, "").replace(/\.mp3$/, "");
}

function decoysOf(video: ScheduledVideo): string[] {
  const decoys = video.episode.inputProps.decoyLogoNames;
  return Array.isArray(decoys) ? (decoys as string[]) : [];
}

function LogoName({ name }: { name: string }) {
  const icon = iconByName.get(name);
  return (
    <span className={styles.videoLogo}>
      {icon && <img src={icon} alt="" width={24} height={24} />}
      {name}
    </span>
  );
}

function AdminVideosPage() {
  const [seriesFilter, setSeriesFilter] = useQueryState(
    "series",
    seriesFilterParser,
  );

  const today = now();
  const todayIndex = schedule.findIndex(
    (video) => daysBetween(today, video.date) === 0,
  );
  const [selectedKey, setSelectedKey] = useQueryState(
    "day",
    parseAsString.withDefault(dayKey(schedule[Math.max(todayIndex, 0)].date)),
  );

  const rows = schedule
    .map((video) => ({ key: dayKey(video.date), video }))
    .filter(
      ({ video }) => seriesFilter === "all" || video.series === seriesFilter,
    );
  const selected =
    schedule.find((video) => dayKey(video.date) === selectedKey) ?? schedule[0];

  return (
    <>
      <h1 className={styles.title}>Admin — Videos ({schedule.length})</h1>

      <div className={styles.sortRow}>
        <span className={styles.sortLabel}>Series</span>
        {SERIES_FILTERS.map((series) => (
          <button
            key={series}
            type="button"
            className={`${styles.sortBtn} ${seriesFilter === series ? styles.sortBtnActive : ""}`}
            onClick={() => setSeriesFilter(series)}
          >
            {series === "all" ? "All" : SERIES_LABELS[series]}
          </button>
        ))}
      </div>

      <div className={styles.videosLayout}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Series</th>
                <th>#</th>
                <th>Logo</th>
                <th>Decoys</th>
                <th>Music</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ video, key }) => {
                const offset = daysBetween(today, video.date);
                return (
                  <tr
                    key={key}
                    className={[
                      styles.clickableRow,
                      offset === 0 ? styles.todayRow : "",
                      offset < 0 ? styles.publishedRow : "",
                      key === dayKey(selected.date) ? styles.selectedRow : "",
                    ].join(" ")}
                    onClick={() => setSelectedKey(key)}
                  >
                    <td>
                      {formatDate(video.date)} ({dayOffsetLabel(offset)})
                    </td>
                    <td>{SERIES_LABELS[video.series]}</td>
                    <td>{video.episodeNumber}</td>
                    <td>
                      <LogoName name={video.episode.name} />
                    </td>
                    <td>{decoysOf(video).join(", ") || "—"}</td>
                    <td>{musicLabel(video.episode.inputProps.musicSrc)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.videoPanel}>
          <div className={styles.statsCardHeader}>
            <h2 className={styles.statsCardTitle}>
              {SERIES_LABELS[selected.series]} #{selected.episodeNumber}
            </h2>
            <span className={styles.sortLabel}>
              {formatDate(selected.date)}
            </span>
          </div>
          <p className={styles.videoAnswer}>
            <LogoName name={selected.episode.name} />
          </p>
          <div className={styles.videoFrame}>
            <Suspense
              fallback={<p className={styles.empty}>Loading player…</p>}
            >
              <VideoPreview
                key={dayKey(selected.date)}
                compositionId={selected.compositionId}
                inputProps={selected.episode.inputProps}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
