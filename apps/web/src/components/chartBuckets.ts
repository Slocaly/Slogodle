export const BUCKET_ORDER = ["1 try", "2 tries", "3 tries", "Historic win", "Failed"] as const;
export type Bucket = (typeof BUCKET_ORDER)[number];

// Mirrors --success, --accent-yellow, --accent-lavender, --danger from
// global.css: SVG fill attributes don't reliably resolve CSS custom
// properties, so the light/dark values are duplicated here instead.
export const BUCKET_COLORS_LIGHT: Record<Bucket, string> = {
  "1 try": "oklch(0.56 0.15 155)",
  "2 tries": "oklch(0.87 0.13 95)",
  "3 tries": "oklch(0.8 0.1 300)",
  "Historic win": "oklch(0.7 0.12 230)",
  Failed: "oklch(0.6 0.19 15)",
};

export const BUCKET_COLORS_DARK: Record<Bucket, string> = {
  "1 try": "oklch(0.65 0.14 155)",
  "2 tries": "oklch(0.78 0.13 95)",
  "3 tries": "oklch(0.68 0.1 300)",
  "Historic win": "oklch(0.6 0.12 230)",
  Failed: "oklch(0.65 0.18 20)",
};
