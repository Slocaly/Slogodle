// Renders one video per logo for a given series into out/<series>/.
//
//   pnpm render:all multiple-choice --count 3            # next 3 episodes after the last one rendered
//   pnpm render:all guess --from 10 --count 5            # episodes 10..14 only
//   pnpm render:all name-choice --list                   # print the episode order without rendering
//
// Series: multiple-choice (LogoMultipleChoice), guess (GuessTheLogo), name-choice (LogoNameChoice).
//
// The last episode rendered for each series is tracked in rendered.txt (committed, unlike out/),
// so --from defaults to the episode right after it.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { SERIES, type SeriesName } from "../src/lib/videoSeries";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    from: { type: "string" },
    count: { type: "string" },
    list: { type: "boolean", default: false },
  },
});

const seriesName = positionals[0];
if (!seriesName || !(seriesName in SERIES)) {
  console.error(`Usage: pnpm render:all <${Object.keys(SERIES).join("|")}> [--from N] [--count N] [--list]`);
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "out", seriesName);
const renderedFile = path.join(root, "rendered.txt");

function readRendered(): Record<string, number> {
  if (!existsSync(renderedFile)) return {};
  const rendered: Record<string, number> = {};
  for (const line of readFileSync(renderedFile, "utf8").split("\n")) {
    const [series, last] = line.trim().split(/\s+/);
    if (!series || series.startsWith("#")) continue;
    rendered[series] = Number(last);
  }
  return rendered;
}

function markRendered(episodeNumber: number) {
  const rendered = readRendered();
  if ((rendered[seriesName] ?? 0) >= episodeNumber) return;
  rendered[seriesName] = episodeNumber;
  const lines = Object.keys(SERIES).map((series) => `${series} ${rendered[series] ?? 0}`);
  writeFileSync(renderedFile, `# Last episode rendered per series (updated by render-all.mts)\n${lines.join("\n")}\n`);
}

const { compositionId, episodes } = SERIES[seriesName as SeriesName]();
const pad = String(episodes.length).length;
const start = values.from ? Number(values.from) - 1 : (readRendered()[seriesName] ?? 0);
const end = values.count ? start + Number(values.count) : episodes.length;

function outputPath(index: number, name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return path.join(outDir, `${String(index + 1).padStart(pad, "0")}-${slug}.mp4`);
}

if (values.list) {
  episodes.forEach((episode, index) => {
    console.log(`${String(index + 1).padStart(pad, "0")}  ${episode.label}`);
  });
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });

console.log("Bundling…");
const serveUrl = await bundle({
  entryPoint: path.join(root, "src", "index.ts"),
  rootDir: root,
  publicDir: path.join(root, "public"),
});

for (let index = start; index < Math.min(end, episodes.length); index++) {
  const episode = episodes[index];
  const outputLocation = outputPath(index, episode.name);
  const label = `[${index + 1}/${episodes.length}] ${episode.name}`;

  if (existsSync(outputLocation)) {
    console.log(`${label} — already rendered, skipping`);
    markRendered(index + 1);
    continue;
  }

  const inputProps = { ...episode.inputProps, debugSafeZones: false };
  const composition = await selectComposition({ serveUrl, id: compositionId, inputProps });

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    videoBitrate: "9M",
    inputProps,
    outputLocation,
    onProgress: ({ progress }) => {
      process.stdout.write(`\r${label} — ${Math.round(progress * 100)}%`);
    },
  });
  process.stdout.write("\n");
  markRendered(index + 1);
}
