# Guess the Logo

A daily logo-guessing game built with TanStack Start (React + TypeScript).

## Commands

| Command               | Action                                                              |
| :--------------------- | :------------------------------------------------------------------- |
| `pnpm run dev`          | Starts the dev server                                                |
| `pnpm run build`        | Production build                                                     |
| `pnpm run start`        | Preview a production build                                           |
| `pnpm run deploy`       | Build and deploy to Cloudflare Workers                               |
| `pnpm run cf-typegen`   | Regenerate Cloudflare binding types (runs automatically on install)  |

## Cloudflare setup

The game reads logos and metadata from R2/D1 at runtime via Cloudflare Worker
bindings. Locally, `wrangler.jsonc` marks both bindings `remote: true` so
`pnpm dev` connects to the real R2 bucket and D1 database instead of an
empty local simulator — this means local dev requires being logged in to
Wrangler with access to the project's Cloudflare account
(`pnpm exec wrangler login`).
