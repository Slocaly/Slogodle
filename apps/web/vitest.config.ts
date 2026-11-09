import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts on purpose: unit tests don't need the
// Cloudflare, TanStack Start, Paraglide or React Compiler plugins.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
