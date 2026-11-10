import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts on purpose: unit tests don't need the
// Cloudflare, TanStack Start, Paraglide or React Compiler plugins.
export default defineConfig({
  resolve: { dedupe: ["react", "react-dom"], tsconfigPaths: true },
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
