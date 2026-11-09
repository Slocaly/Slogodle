// Plans the next batch of daily videos to publish, as JSON on stdout.
//
//   pnpm plan:batch --from-day 35 --count 10              # days 35..44
//   pnpm plan:batch --from-day 35 --count 10 --window 5   # flag repeats within 5 days instead of 3
//
// For each day: date, Paris 10:00 dueAt, series, episode, local file and R2 key.
// Also lists the render-all ranges needed per series, and warns when a logo shows up
// again within --window days of another video (as the answer, or as a decoy).
import path from "node:path";
import { parseArgs } from "node:util";
import {
  buildPublishSchedule,
  SERIES,
  type SeriesName,
} from "../src/lib/videoSeries";

const { values } = parseArgs({
  options: {
    "from-day": { type: "string" },
    count: { type: "string" },
    window: { type: "string", default: "3" },
  },
});

const fromDay = Number(values["from-day"]);
const count = Number(values.count);
const window = Number(values.window);
if (!fromDay || !count) {
  console.error("Usage: pnpm plan:batch --from-day N --count N [--window N]");
  process.exit(1);
}

const PUBLISH_HOUR = 10;
const TIME_ZONE = "Europe/Paris";

const root = path.resolve(import.meta.dirname, "..");
const schedule = buildPublishSchedule();

// Same numbering and slug as render-all.mts, so the paths match the rendered files.
const pads = Object.fromEntries(
  (Object.keys(SERIES) as SeriesName[]).map((name) => [
    name,
    String(SERIES[name]().episodes.length).length,
  ]),
) as Record<SeriesName, number>;

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function localDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parisDueAt(date: Date) {
  const day = localDate(date);
  // Noon UTC is the same calendar day in Paris, so its offset is the one for that day.
  const offset = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date(`${day}T12:00:00Z`))
    .find((part) => part.type === "timeZoneName")!
    .value.replace("GMT", "");
  return `${day}T${String(PUBLISH_HOUR).padStart(2, "0")}:00:00${offset || "+00:00"}`;
}

function decoysOf(index: number): string[] {
  const props = schedule[index].episode.inputProps as {
    decoyLogoNames?: string[];
  };
  return props.decoyLogoNames ?? [];
}

const videos = [];
const warnings = [];

for (let day = fromDay; day < fromDay + count; day++) {
  const index = day - 1;
  const item = schedule[index];
  if (!item) {
    warnings.push({
      day,
      message: `No episode left for day #${day}: every series has run out.`,
    });
    break;
  }

  const fileName = `${String(item.episodeNumber).padStart(pads[item.series], "0")}-${slugify(item.episode.name)}.mp4`;
  videos.push({
    day,
    date: localDate(item.date),
    dueAt: parisDueAt(item.date),
    series: item.series,
    episodeNumber: item.episodeNumber,
    logo: item.episode.name,
    file: path.join(root, "out", item.series, fileName),
    r2Key: `${item.series}-${fileName}`,
  });

  for (
    let other = Math.max(0, index - window);
    other <= Math.min(schedule.length - 1, index + window);
    other++
  ) {
    if (other === index) continue;
    const otherItem = schedule[other];
    const gap = Math.abs(other - index);
    if (otherItem.episode.name === item.episode.name) {
      // Report each pair once when both days are in the batch.
      if (other > index && other < fromDay - 1 + count) continue;
      warnings.push({
        day,
        kind: "answer",
        message: `${item.episode.name} is the answer on day #${day} (${item.series}) and day #${other + 1} (${otherItem.series}), ${gap} day(s) apart.`,
      });
    } else if (decoysOf(other).includes(item.episode.name)) {
      warnings.push({
        day,
        kind: "decoy",
        message: `${item.episode.name} (answer on day #${day}) is a decoy on day #${other + 1} (${otherItem.series}), ${gap} day(s) apart.`,
      });
    }
  }
}

// Contiguous episode ranges per series, ready for `pnpm render:all <series> --from F --count C`.
const renders = (Object.keys(SERIES) as SeriesName[]).flatMap((series) => {
  const episodes = videos
    .filter((video) => video.series === series)
    .map((video) => video.episodeNumber);
  if (episodes.length === 0) return [];
  const from = Math.min(...episodes);
  return [{ series, from, count: Math.max(...episodes) - from + 1 }];
});

console.log(JSON.stringify({ videos, renders, warnings }, null, 2));
