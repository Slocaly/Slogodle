// Renders the three Slogodle demo videos shown on the landing page.
//
//   pnpm render:landing
//
// Full-quality masters go to out/slogodle/, then ffmpeg (must be on PATH) writes a
// web-sized copy + poster frame for each into apps/landing/public/videos/.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const DECOYS = ["Svelte", "Stylelint", "Supabase"];
const POSTER_SECONDS = 2; // mid-countdown: the "3" badge with the bar partly drained

const VIDEOS = [
  {
    slug: "guess-the-logo",
    compositionId: "GuessTheLogo",
    inputProps: { logoName: "Slogodle", musicSrc: "music/HoliznaCC0 - The Best Of Times.mp3" },
  },
  {
    slug: "multiple-choice",
    compositionId: "LogoMultipleChoice",
    inputProps: {
      targetLogoName: "Slogodle",
      decoyLogoNames: DECOYS,
      musicSrc: "music/HoliznaCC0 - Break From Reality.mp3",
    },
  },
  {
    slug: "name-choice",
    compositionId: "LogoNameChoice",
    inputProps: { targetLogoName: "Slogodle", decoyLogoNames: DECOYS, musicSrc: "music/HoliznaCC0 - Tetrapod.mp3" },
  },
];

const root = path.resolve(import.meta.dirname, "..");
const masterDir = path.join(root, "out", "slogodle");
const landingDir = path.resolve(root, "..", "landing", "public", "videos");
mkdirSync(masterDir, { recursive: true });
mkdirSync(landingDir, { recursive: true });

console.log("Bundling…");
const serveUrl = await bundle({
  entryPoint: path.join(root, "src", "index.ts"),
  rootDir: root,
  publicDir: path.join(root, "public"),
});

for (const video of VIDEOS) {
  const master = path.join(masterDir, `${video.slug}.mp4`);
  const inputProps = { ...video.inputProps, debugSafeZones: false };
  // Remaining props (revealDelayInFrames) come from the composition's defaultProps.
  const composition = await selectComposition({ serveUrl, id: video.compositionId, inputProps });

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    videoBitrate: "9M",
    inputProps: composition.props,
    outputLocation: master,
    onProgress: ({ progress }) => {
      process.stdout.write(`\r${video.slug} — ${Math.round(progress * 100)}%`);
    },
  });
  process.stdout.write("\n");

  const web = path.join(landingDir, `${video.slug}.mp4`);
  const poster = path.join(landingDir, `${video.slug}.jpg`);
  // prettier-ignore
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-i", master,
    "-vf", "scale=540:960", "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart",
    web,
  ], { stdio: "inherit" });
  // prettier-ignore
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-ss", String(POSTER_SECONDS), "-i", master,
    "-frames:v", "1", "-vf", "scale=540:960", "-q:v", "3",
    poster,
  ], { stdio: "inherit" });
  console.log(`${video.slug} — wrote ${path.relative(process.cwd(), web)} + poster`);
}
