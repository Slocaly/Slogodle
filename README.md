# Slogodle

Monorepo for the logo-guessing game and related tools.

## Layout

| Path              | Description                                    |
| :----------------- | :---------------------------------------------- |
| `apps/web`         | The game itself — TanStack Start (React + TS)  |
| `packages/logos`   | Shared logo assets and metadata                |

## Commands

Run from the repo root:

| Command          | Action                                |
| :---------------- | :------------------------------------ |
| `pnpm install`     | Install all workspace dependencies    |
| `pnpm run dev`     | Starts the web app's dev server       |
| `pnpm run build`   | Production build of the web app       |
| `pnpm run start`   | Preview the web app's production build|
