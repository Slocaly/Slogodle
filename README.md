# Slogodle

Monorepo for the logo-guessing game and related tools.

## Layout

| Path             | Description                                   |
| :--------------- | :-------------------------------------------- |
| `apps/web`       | The game itself — TanStack Start (React + TS) |
| `packages/logos` | Shared logo assets and metadata               |

## Commands

Run from the repo root ([Turborepo](https://turborepo.com) orchestrates and caches tasks across workspaces):

| Command          | Action                                                |
| :--------------- | :---------------------------------------------------- |
| `pnpm install`   | Install all workspace dependencies                    |
| `pnpm run dev`   | Starts the dev server for every app                   |
| `pnpm run build` | Production build of every workspace with a build task |
| `pnpm run start` | Preview the web app's production build                |
| `pnpm run lint`  | Lint every workspace with a lint task                 |

## Variants

`apps/web` builds one deployment per brand. The build-time env var `VARIANT` (`tech` or `brand`) selects the brand config in `apps/web/src/brands`; `CLOUDFLARE_ENV` selects the matching wrangler environment (`env.brand` in `apps/web/wrangler.jsonc`; the top level is `tech`).

| Script (in `apps/web`)    | Action                                      |
| :------------------------ | :------------------------------------------ |
| `dev` / `dev:brand`       | Dev server for `tech` / `brand`             |
| `build` / `build:brand`   | Production build for `tech` / `brand`       |
| `deploy` / `deploy:brand` | Build then `wrangler deploy` for each brand |

Both variants share one D1 database; each has its own R2 logo bucket. Builds write to the same `dist`, so run them sequentially.

### Shipping a new brand (manual steps)

1. Create the bucket: `wrangler r2 bucket create brand-logos`.
2. Set secrets for the env with `wrangler secret put <NAME> --env brand`:
   - `BETTER_AUTH_SECRET`: same value as `tech` (shared login cookie on `.slogodle.com`)
   - `BETTER_AUTH_URL`: the brand origin (e.g. `https://brand.slogodle.com`)
   - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: from a separate GitHub OAuth App per brand (an OAuth App allows only one callback URL)
   - `RESEND_API_KEY`, `EMAIL_FROM`
3. Apply the migration: `wrangler d1 migrations apply slogodle --remote`, then deploy immediately (`pnpm --filter web deploy` and `deploy:brand`). Between migration and deploy the old admin logo upsert breaks; game play does not.
