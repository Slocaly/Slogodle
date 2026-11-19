import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts on purpose: unit tests don't need the
// Cloudflare, TanStack Start, Paraglide or React Compiler plugins.
export default defineConfig({
  define: { __VARIANT__: JSON.stringify("tech") },
  plugins: [
    {
      // "cloudflare:workers" only exists in the Workers runtime. Server modules
      // import `env` from it at the top level, so give tests an empty stand-in
      // (a test that needs bindings can still vi.mock it with its own `env`).
      name: "cloudflare-workers-stub",
      load: (id) =>
        id === "\0cloudflare:workers" ? "export const env = {};" : undefined,
      resolveId: (id) =>
        id === "cloudflare:workers" ? "\0cloudflare:workers" : undefined,
    },
  ],
  resolve: { dedupe: ["react", "react-dom"], tsconfigPaths: true },
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
