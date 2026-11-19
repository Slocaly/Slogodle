import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tsConfigPaths from "vite-tsconfig-paths";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { getBrand } from "./src/brands";

// Fail the build loudly on an unknown VARIANT.
getBrand(process.env.VARIANT);

export default defineConfig({
  // Build-time brand selection (see src/brands). Unset -> undefined -> tech.
  define: { __VARIANT__: JSON.stringify(process.env.VARIANT) },
  // The admin video previews import the Remotion compositions from apps/video, which
  // resolve their own react/remotion copies otherwise (and break the Player's contexts).
  resolve: {
    dedupe: ["react", "react-dom", "remotion"],
  },
  // Lets the dev server be reached through a temporary Cloudflare tunnel (phone testing).
  server: {
    allowedHosts: [".trycloudflare.com"],
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    paraglideVitePlugin({
      outdir: "./src/paraglide",
      project: "./project.inlang",
      strategy: ["cookie", "preferredLanguage", "baseLocale"],
    }),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});
