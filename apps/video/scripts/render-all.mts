// Renders one video per logo for a given series into out/<series>/.
//
//   pnpm render:all multiple-choice                      # everything, skipping videos already rendered
//   pnpm render:all guess --from 10 --count 5            # episodes 10..14 only
//   pnpm render:all name-choice --list                   # print the episode order without rendering
//
// Series: multiple-choice (LogoMultipleChoice), guess (GuessTheLogo), name-choice (LogoNameChoice).
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import {
  buildGuessTheLogoEpisodes,
  buildMultipleChoiceEpisodes,
  buildNameChoiceEpisodes,
} from "../src/lib/videoOrder";

interface Series {
  compositionId: string;
  episodes: { name: string; label: string; inputProps: Record<string, unknown> }[];
}

const SERIES: Record<string, () => Series> = {
  "multiple-choice": () => ({
    compositionId: "LogoMultipleChoice",
    episodes: buildMultipleChoiceEpisodes().map((episode) => ({
      name: episode.targetLogoName,
      label: `${episode.targetLogoName}  (decoys: ${episode.decoyLogoNames.join(", ")})`,
      inputProps: { ...episode },
    })),
  }),
  "name-choice": () => ({
    compositionId: "LogoNameChoice",
    episodes: buildNameChoiceEpisodes().map((episode) => ({
      name: episode.targetLogoName,
      label: `${episode.targetLogoName}  (decoys: ${episode.decoyLogoNames.join(", ")})`,
      inputProps: { ...episode, revealDelayInFrames: 135 },
    })),
  }),
  guess: () => ({
    compositionId: "GuessTheLogo",
    episodes: buildGuessTheLogoEpisodes().map((episode) => ({
      name: episode.logoName,
      label: episode.logoName,
      inputProps: { ...episode, revealDelayInFrames: 135 },
    })),
  }),
};

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    from: { type: "string", default: "1" },
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

const { compositionId, episodes } = SERIES[seriesName]();
const pad = String(episodes.length).length;
const start = Number(values.from) - 1;
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
}
