# Slogodle

Monorepo for the logo-guessing game and related tools.

## Layout

| Path              | Description                                    |
| :----------------- | :---------------------------------------------- |
| `apps/web`         | The game itself — TanStack Start (React + TS)  |
| `packages/logos`   | Shared logo assets and metadata                |

## Commands

Run from the repo root ([Turborepo](https://turborepo.com) orchestrates and caches tasks across workspaces):

| Command          | Action                                          |
| :---------------- | :----------------------------------------------- |
| `pnpm install`     | Install all workspace dependencies              |
| `pnpm run dev`     | Starts the dev server for every app             |
| `pnpm run build`   | Production build of every workspace with a build task |
| `pnpm run start`   | Preview the web app's production build          |
| `pnpm run lint`    | Lint every workspace with a lint task            |
