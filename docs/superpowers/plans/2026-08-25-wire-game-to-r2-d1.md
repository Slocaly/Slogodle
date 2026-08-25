# Wire the game to R2 and D1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the live game (`/`) read logo icons and metadata from R2/D1 via native Cloudflare Worker bindings, replacing the static `@slogodle/logos` `LOGOS` array as the runtime data source.

**Architecture:** Add an R2 binding alongside the existing D1 binding, accessed through `import { env } from "cloudflare:workers"`. Add `@cloudflare/vite-plugin` so local dev gets real bindings too. Serve icons same-origin via a `/api/logos/:key` route added directly to the Worker's `fetch` handler. Fetch the full logo bank once client-side (the `/` route is already `ssr: false`) and thread it through the existing component props, replacing direct `LOGOS` imports.

**Tech Stack:** TanStack Start (React), Cloudflare Workers, D1, R2, `@cloudflare/vite-plugin`, Vite.

**Spec:** `docs/superpowers/specs/2026-08-25-wire-game-to-r2-d1-design.md`

## Global Constraints

- No automated test suite exists anywhere in this repo (no vitest/jest, no `*.test.*` files). Do not introduce one as part of this plan — each task ends with a **manual verification** step (what to look at / run and what you should see) instead of an automated test-run step, matching this project's existing manual-QA convention.
- Never run `git add` / `git commit`. Leave changes unstaged/uncommitted — the project owner commits everything themselves.
- Never run any command that mutates the **remote/production** Cloudflare account (`wrangler d1 migrations apply <db> --remote`, `wrangler d1 migrations apply <db>` without `--local`, `wrangler deploy`, `pnpm sync-logos`) without the user explicitly running it themselves or explicitly telling you to run it in that moment. `--local` D1 commands are safe to run freely (they operate on a local SQLite file under `.wrangler/state`, no cloud impact).
- Don't proactively run build/typecheck/dev-server commands to "double check" your own work — describe what changed and what to look at, and let the project owner verify by running the app themselves.
- Existing `Logo` type (`packages/logos/src/logos.ts`): `{ name: string; industry: string; founded: number; description: string; funFact: string; icon: string; aspect: number; gitLink: string }`. Every new piece of code producing a `Logo` must match this shape exactly — components consuming `Logo` (`GuessHints`, `LogoCard`, `RevealPanel`) must not need to change.
- Bucket name is `logos` (confirmed from `.env`'s `R2_BUCKET` value). D1 database binding name is already `DB` (see `wrangler.jsonc`); its `database_name` is `slogodle`.

---

### Task 1: D1 schema — `day_order` column and `sync-logos.ts`

**Files:**
- Create: `apps/web/migrations/0002_add_day_order.sql`
- Modify: `apps/web/scripts/sync-logos.ts:152-176` (the `upsertMetadata` function)

**Interfaces:**
- Produces: a `day_order INTEGER` column on `logo_metadata`, backfilled to match `id` for existing rows, with a unique index; new rows inserted by `sync-logos.ts` get the next available `day_order` automatically.
- Consumes: nothing from other tasks.

- [ ] **Step 1: Write the migration**

Create `apps/web/migrations/0002_add_day_order.sql`:

```sql
-- Migration number: 0002 	 2026-08-25T00:00:00.000Z

ALTER TABLE logo_metadata ADD COLUMN day_order INTEGER;
UPDATE logo_metadata SET day_order = id WHERE day_order IS NULL;
CREATE UNIQUE INDEX idx_logo_metadata_day_order ON logo_metadata(day_order);
```

- [ ] **Step 2: Apply the migration locally**

Run: `cd apps/web && npx wrangler d1 migrations apply slogodle --local`

This only touches a local SQLite file under `apps/web/.wrangler/state` — safe to run freely.

Expected output: wrangler reports migration `0002_add_day_order.sql` applied successfully (alongside `0001_create_logo_metadata.sql`, which will already show as applied from prior work — if `0001` shows as applied and `0002` is newly applied, that's correct).

- [ ] **Step 3: Update `upsertMetadata` in `sync-logos.ts` to assign `day_order` on insert**

Change (around `apps/web/scripts/sync-logos.ts:152-176`):

```ts
async function upsertMetadata(r2Key: string, logo: Logo): Promise<void> {
  await d1Query(
    `INSERT INTO logo_metadata (r2_key, name, industry, founded, description, fun_fact, git_link, aspect)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(r2_key) DO UPDATE SET
       name = excluded.name,
       industry = excluded.industry,
       founded = excluded.founded,
       description = excluded.description,
       fun_fact = excluded.fun_fact,
       git_link = excluded.git_link,
       aspect = excluded.aspect,
       updated_at = CURRENT_TIMESTAMP`,
    [
      r2Key,
      logo.name,
      logo.industry,
      logo.founded,
      logo.description,
      logo.funFact,
      logo.gitLink,
      logo.aspect,
    ],
  );
}
```

to:

```ts
async function upsertMetadata(r2Key: string, logo: Logo): Promise<void> {
  await d1Query(
    `INSERT INTO logo_metadata (r2_key, name, industry, founded, description, fun_fact, git_link, aspect, day_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(day_order), 0) + 1 FROM logo_metadata))
     ON CONFLICT(r2_key) DO UPDATE SET
       name = excluded.name,
       industry = excluded.industry,
       founded = excluded.founded,
       description = excluded.description,
       fun_fact = excluded.fun_fact,
       git_link = excluded.git_link,
       aspect = excluded.aspect,
       updated_at = CURRENT_TIMESTAMP`,
    [
      r2Key,
      logo.name,
      logo.industry,
      logo.founded,
      logo.description,
      logo.funFact,
      logo.gitLink,
      logo.aspect,
    ],
  );
}
```

Note: the `day_order` subquery only runs for the `INSERT` branch — the `ON CONFLICT DO UPDATE SET` clause deliberately does not touch `day_order`, so re-running `sync-logos` on an existing row never reshuffles it.

- [ ] **Step 4: Manual verification**

This task doesn't run `sync-logos` (that writes to the real production D1 over the REST API — leave that to the project owner to run when they're ready). Instead, verify locally:

Run: `cd apps/web && npx wrangler d1 execute slogodle --local --command "SELECT r2_key, day_order FROM logo_metadata ORDER BY day_order LIMIT 5"`

Expected: rows come back with a non-null, sequential-looking `day_order` for each (mirroring `id` order), confirming the backfill worked. Tell the project owner that `sync-logos.ts` is updated and ready, but they should run `pnpm sync-logos` themselves (against the real D1) whenever they next add logos, and separately run `npx wrangler d1 migrations apply slogodle --remote` themselves to apply this migration to production D1 when ready.

---

### Task 2: Cloudflare bindings infrastructure

**Files:**
- Modify: `apps/web/wrangler.jsonc`
- Modify: `apps/web/package.json`
- Modify: `apps/web/vite.config.ts`
- Modify: `apps/web/tsconfig.json`
- Modify: `apps/web/.gitignore` (create if it doesn't exist)

**Interfaces:**
- Produces: an `R2Bucket` binding named `LOGO_BUCKET` and a working `Env` type (`env.DB: D1Database`, `env.LOGO_BUCKET: R2Bucket`) usable via `import { env } from "cloudflare:workers"` anywhere in server-side code, in both `vite dev` and production.
- Consumes: nothing from other tasks.

- [ ] **Step 1: Add the R2 binding to `wrangler.jsonc`**

Modify `apps/web/wrangler.jsonc` — add `r2_buckets` alongside the existing `d1_databases`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "slogodle",
  "compatibility_date": "2026-08-19",
  "compatibility_flags": ["nodejs_compat"],
  "observability": {
    "enabled": true
  },
  "main": "dist/server/server.js",
  "assets": {
    "directory": "dist/client"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "slogodle",
      "database_id": "d993c41e-9dc1-4065-aa03-7988fca0ff06",
      "migrations_dir": "migrations"
    }
  ],
  "r2_buckets": [
    {
      "binding": "LOGO_BUCKET",
      "bucket_name": "logos"
    }
  ]
}
```

- [ ] **Step 2: Install `@cloudflare/vite-plugin` and add a typegen script**

Run: `cd apps/web && pnpm add -D @cloudflare/vite-plugin`

Then modify `apps/web/package.json`'s `scripts` block to add `cf-typegen`:

```json
"scripts": {
  "dev": "vite dev",
  "build": "vite build",
  "start": "vite preview",
  "cf-typegen": "wrangler types",
  "sync-logos": "node --env-file=.env scripts/sync-logos.ts"
}
```

- [ ] **Step 3: Generate the `Env` types**

Run: `cd apps/web && pnpm cf-typegen`

Expected: a new file `apps/web/worker-configuration.d.ts` is created, exporting a global `Env` interface with `DB: D1Database` and `LOGO_BUCKET: R2Bucket` members. This is a read-only, local generation step — safe to run.

- [ ] **Step 4: Make TypeScript pick up the generated types**

`apps/web/tsconfig.json` currently has `"include": ["src"]`, so the root-level `worker-configuration.d.ts` would otherwise be invisible to the compiler. Change:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowJs": true,
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src", "worker-configuration.d.ts"]
}
```

- [ ] **Step 5: Ignore the generated types file**

Add to `apps/web/.gitignore` (create the file with this content if `apps/web` doesn't already have its own `.gitignore` — the repo root `.gitignore` already has a "generated types" section for `.tanstack/`, so mirror that convention):

```
# generated types
worker-configuration.d.ts
```

- [ ] **Step 6: Add the Cloudflare Vite plugin**

Modify `apps/web/vite.config.ts` from:

```ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tsConfigPaths from 'vite-tsconfig-paths'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ['./tsconfig.json'] }),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['cookie', 'preferredLanguage', 'baseLocale'],
    }),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})
```

to:

```ts
import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tsConfigPaths from 'vite-tsconfig-paths'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tsConfigPaths({ projects: ['./tsconfig.json'] }),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      strategy: ['cookie', 'preferredLanguage', 'baseLocale'],
    }),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})
```

- [ ] **Step 7: Manual verification**

Tell the project owner to run `pnpm dev` from `apps/web` themselves and confirm the game still loads at `http://localhost:3000` (or whatever port Vite picks) exactly as before — this step only adds infrastructure, nothing reads the new binding yet, so behavior must be unchanged. If `vite dev` fails to start, the most likely cause is a `@cloudflare/vite-plugin` / `@tanstack/react-start` plugin ordering or version mismatch — check the plugin's error output.

---

### Task 3: Same-origin image route for R2-backed icons

**Files:**
- Modify: `apps/web/src/server.ts`

**Interfaces:**
- Consumes: `Env.LOGO_BUCKET` (from Task 2).
- Produces: `GET /api/logos/:key` — serves the raw object body from R2 with `Content-Type: image/svg+xml` and long-lived caching, or a 404 `Response` if the key doesn't exist.

- [ ] **Step 1: Add the route to the Worker's fetch handler**

Change `apps/web/src/server.ts` from:

```ts
import handler from '@tanstack/react-start/server-entry'
import { paraglideMiddleware } from './paraglide/server.js'

export default {
  fetch(request: Request): Promise<Response> {
    // TanStack Router handles URL rewriting itself, so we pass the original
    // `request` through untouched — paraglideMiddleware only needs it to
    // resolve the per-request locale (cookie -> Accept-Language -> baseLocale).
    return paraglideMiddleware(request, () => handler.fetch(request))
  },
}
```

to:

```ts
import handler from '@tanstack/react-start/server-entry'
import { env } from 'cloudflare:workers'
import { paraglideMiddleware } from './paraglide/server.js'

const LOGO_KEY_PATTERN = /^\/api\/logos\/([^/]+)$/

async function serveLogoIcon(key: string): Promise<Response> {
  const object = await env.LOGO_BUCKET.get(key)
  if (!object) {
    return new Response('Not found', { status: 404 })
  }
  return new Response(object.body, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

export default {
  fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const match = url.pathname.match(LOGO_KEY_PATTERN)
    if (match) {
      return serveLogoIcon(match[1])
    }
    // TanStack Router handles URL rewriting itself, so we pass the original
    // `request` through untouched — paraglideMiddleware only needs it to
    // resolve the per-request locale (cookie -> Accept-Language -> baseLocale).
    return paraglideMiddleware(request, () => handler.fetch(request))
  },
}
```

- [ ] **Step 2: Manual verification**

Tell the project owner to run `pnpm dev` and, once at least one object exists in the `logos` R2 bucket (it already does, from earlier `sync-logos` runs), visit `http://localhost:3000/api/logos/<some-existing-r2-key>.svg` directly in the browser (they can find a valid key from the admin page's Table/Grid/Form view, or from `public/logos/` filenames). Confirm the SVG renders directly in the browser tab, and that `http://localhost:3000/api/logos/does-not-exist.svg` returns a 404.

---

### Task 4: D1-backed game logo bank (data layer)

**Files:**
- Create: `apps/web/src/lib/game-logos.server.ts`
- Create: `apps/web/src/lib/game-logos.ts`

**Interfaces:**
- Consumes: `Env.DB` (from Task 2); the `Logo` type from `@slogodle/logos`.
- Produces: `fetchGameLogos(): Promise<Logo[]>` (a `createServerFn`-wrapped function), the client-callable entry point Task 5 uses to load the bank. Each returned `Logo`'s `icon` is `/api/logos/{r2_key}` (served by Task 3).

- [ ] **Step 1: Write `game-logos.server.ts`**

Create `apps/web/src/lib/game-logos.server.ts`:

```ts
import { env } from "cloudflare:workers";
import type { Logo } from "@slogodle/logos";

interface CompleteLogoRow {
  r2_key: string;
  name: string;
  industry: string;
  founded: number;
  description: string;
  fun_fact: string;
  git_link: string;
  aspect: number;
}

function toLogo(row: CompleteLogoRow): Logo {
  return {
    name: row.name,
    industry: row.industry,
    founded: row.founded,
    description: row.description,
    funFact: row.fun_fact,
    icon: `/api/logos/${row.r2_key}`,
    aspect: row.aspect,
    gitLink: row.git_link,
  };
}

/**
 * Every field a `Logo` needs must be non-null for a row to be playable —
 * rows still being filled in via the admin page are silently excluded.
 */
export async function listGameLogos(): Promise<Logo[]> {
  const { results } = await env.DB.prepare(
    `SELECT r2_key, name, industry, founded, description, fun_fact, git_link, aspect
     FROM logo_metadata
     WHERE name IS NOT NULL
       AND industry IS NOT NULL
       AND founded IS NOT NULL
       AND description IS NOT NULL
       AND fun_fact IS NOT NULL
       AND git_link IS NOT NULL
       AND aspect IS NOT NULL
       AND day_order IS NOT NULL
     ORDER BY day_order`,
  ).all<CompleteLogoRow>();
  return results.map(toLogo);
}
```

- [ ] **Step 2: Write the client-callable wrapper**

Create `apps/web/src/lib/game-logos.ts`:

```ts
import { createServerFn } from "@tanstack/react-start";
import { listGameLogos } from "./game-logos.server";

export const fetchGameLogos = createServerFn({ method: "GET" }).handler(() =>
  listGameLogos(),
);
```

This mirrors the existing pattern in `apps/web/src/lib/r2-logos.ts` / `apps/web/src/lib/logo-metadata.ts`.

- [ ] **Step 3: Manual verification**

This function isn't called from any route yet (that's Task 5), so there's nothing to click through. Instead, ask the project owner to confirm (or confirm yourself by reading, not running) that:
- `logo_metadata` in their D1 database actually has rows with every one of `name`, `industry`, `founded`, `description`, `fun_fact`, `git_link`, `aspect`, `day_order` populated (i.e. `pnpm sync-logos` has been run against the real D1 at least once, and Task 1's migration has been applied with `--remote`) — otherwise `fetchGameLogos()` will return an empty array once wired up in Task 5, and the game will be stuck on its loading state. Flag this explicitly to the project owner rather than silently assuming it's done.

---

### Task 5: `useGameState` — fetch the bank, add a loading state

**Files:**
- Modify: `apps/web/src/hooks/useGameState.ts`

**Interfaces:**
- Consumes: `fetchGameLogos()` from Task 4; `pickLogo`, `dayIndexFor`, `isCorrectGuess`, `computeStreak` from `../lib/game-logic` (unchanged); `Guess`, `GameStatus` types (unchanged).
- Produces: `useGameState()` returns the same shape as before, with two changes later tasks depend on:
  - `logo: Logo | null` (was `Logo`) — `null` while the bank is still loading or failed to load.
  - `bank: Logo[]` (new) — the loaded bank, or `[]` while loading.
  - `bankError: string | null` (new) — set if `fetchGameLogos()` rejects.

- [ ] **Step 1: Replace the `LOGOS` import and add bank-loading state**

Modify `apps/web/src/hooks/useGameState.ts`. Change the top of the file from:

```ts
import { useEffect, useState } from 'react'
import { LOGOS, type Logo } from '@slogodle/logos'
import { loadJSON, saveJSON } from '../lib/storage'
import { now, subscribe as subscribeClock } from '../lib/clock'
import { dayIndexFor, pickLogo, isCorrectGuess, computeStreak, type Guess, type GameStatus } from '../lib/game-logic'
import { useDarkMode } from './useDarkMode'
import { useSoundSettings } from './useSoundSettings'
```

to:

```ts
import { useEffect, useState } from 'react'
import type { Logo } from '@slogodle/logos'
import { fetchGameLogos } from '../lib/game-logos'
import { loadJSON, saveJSON } from '../lib/storage'
import { now, subscribe as subscribeClock } from '../lib/clock'
import { dayIndexFor, pickLogo, isCorrectGuess, computeStreak, type Guess, type GameStatus } from '../lib/game-logic'
import { useDarkMode } from './useDarkMode'
import { useSoundSettings } from './useSoundSettings'
```

- [ ] **Step 2: Add bank state and a fetch effect, and gate the rest of the hook on it**

Change the body of `useGameState` from:

```ts
export function useGameState() {
  const [todayIndex, setTodayIndex] = useState(() => dayIndexFor(now()))
  const [activeDayIndex, setActiveDayIndex] = useState(() => dayIndexFor(now()))
  const [pinnedToToday, setPinnedToToday] = useState(true)
  const [days, setDays] = useState<DaysRecord>(loadDays)
  const { dark, toggleDark } = useDarkMode()
  const { soundEnabled, toggleSound } = useSoundSettings()
  const [archiveOpen, setArchiveOpen] = useState(false)

  const logo = pickLogo(LOGOS, activeDayIndex)
  const dayRecord = days[String(activeDayIndex)] ?? EMPTY_DAY
  const isToday = activeDayIndex === todayIndex

  // Persist per-day state whenever it changes.
  useEffect(() => {
    saveJSON(DAYS_KEY, days)
  }, [days])

  // Check once a second whether the real day has rolled over; if it has and
  // we're pinned to today, follow it. If the user has navigated to a past
  // day (unpinned), leave them there through a rollover.
  useEffect(() => {
    const id = setInterval(() => {
      const freshTodayIndex = dayIndexFor(now())
      if (freshTodayIndex !== todayIndex) {
        setTodayIndex(freshTodayIndex)
        if (pinnedToToday) {
          setActiveDayIndex(freshTodayIndex)
        }
      }
    }, 1000)
    return () => clearInterval(id)
  }, [todayIndex, pinnedToToday])

  // React to devtools clock changes immediately, not just on the next 1s tick.
  useEffect(
    () =>
      subscribeClock(() => {
        const freshTodayIndex = dayIndexFor(now())
        setTodayIndex(freshTodayIndex)
        if (pinnedToToday) {
          setActiveDayIndex(freshTodayIndex)
        }
      }),
    [pinnedToToday],
  )

  const history: Record<string, GameStatus> = {}
  const foundLogos: { dayIndex: number; logo: Logo; count: number }[] = []
  for (const [key, record] of Object.entries(days)) {
    if (record.status !== 'playing') {
      history[key] = record.status
    }
    if (record.status === 'won') {
      const dayIndex = Number(key)
      foundLogos.push({ dayIndex, logo: pickLogo(LOGOS, dayIndex), count: MAX_TRIES + 1 - record.guesses.length })
    }
  }
  const streak = computeStreak(history, todayIndex)

  function submitGuess(text: string) {
    if (dayRecord.status !== 'playing' || !text.trim()) return
    const correct = isCorrectGuess(text, logo)
    const guesses = [...dayRecord.guesses, { text: text.trim(), correct }]
    const status: GameStatus = correct ? 'won' : guesses.length >= MAX_TRIES ? 'lost' : 'playing'
    setDays((prev) => ({ ...prev, [String(activeDayIndex)]: { guesses, status } }))
    return { status, attempts: guesses.length }
  }
```

to:

```ts
export function useGameState() {
  const [todayIndex, setTodayIndex] = useState(() => dayIndexFor(now()))
  const [activeDayIndex, setActiveDayIndex] = useState(() => dayIndexFor(now()))
  const [pinnedToToday, setPinnedToToday] = useState(true)
  const [days, setDays] = useState<DaysRecord>(loadDays)
  const { dark, toggleDark } = useDarkMode()
  const { soundEnabled, toggleSound } = useSoundSettings()
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [bank, setBank] = useState<Logo[] | null>(null)
  const [bankError, setBankError] = useState<string | null>(null)

  // Fetch the logo bank from D1 once; the local LOGOS array no longer backs
  // the live game.
  useEffect(() => {
    if (bank !== null || bankError !== null) return
    fetchGameLogos()
      .then(setBank)
      .catch((error: unknown) =>
        setBankError(error instanceof Error ? error.message : String(error)),
      )
  }, [bank, bankError])

  const dayRecord = days[String(activeDayIndex)] ?? EMPTY_DAY
  const isToday = activeDayIndex === todayIndex

  // Persist per-day state whenever it changes.
  useEffect(() => {
    saveJSON(DAYS_KEY, days)
  }, [days])

  // Check once a second whether the real day has rolled over; if it has and
  // we're pinned to today, follow it. If the user has navigated to a past
  // day (unpinned), leave them there through a rollover.
  useEffect(() => {
    const id = setInterval(() => {
      const freshTodayIndex = dayIndexFor(now())
      if (freshTodayIndex !== todayIndex) {
        setTodayIndex(freshTodayIndex)
        if (pinnedToToday) {
          setActiveDayIndex(freshTodayIndex)
        }
      }
    }, 1000)
    return () => clearInterval(id)
  }, [todayIndex, pinnedToToday])

  // React to devtools clock changes immediately, not just on the next 1s tick.
  useEffect(
    () =>
      subscribeClock(() => {
        const freshTodayIndex = dayIndexFor(now())
        setTodayIndex(freshTodayIndex)
        if (pinnedToToday) {
          setActiveDayIndex(freshTodayIndex)
        }
      }),
    [pinnedToToday],
  )

  const logo = bank ? pickLogo(bank, activeDayIndex) : null

  const history: Record<string, GameStatus> = {}
  const foundLogos: { dayIndex: number; logo: Logo; count: number }[] = []
  for (const [key, record] of Object.entries(days)) {
    if (record.status !== 'playing') {
      history[key] = record.status
    }
    if (record.status === 'won' && bank) {
      const dayIndex = Number(key)
      foundLogos.push({ dayIndex, logo: pickLogo(bank, dayIndex), count: MAX_TRIES + 1 - record.guesses.length })
    }
  }
  const streak = computeStreak(history, todayIndex)

  function submitGuess(text: string) {
    if (!logo || dayRecord.status !== 'playing' || !text.trim()) return
    const correct = isCorrectGuess(text, logo)
    const guesses = [...dayRecord.guesses, { text: text.trim(), correct }]
    const status: GameStatus = correct ? 'won' : guesses.length >= MAX_TRIES ? 'lost' : 'playing'
    setDays((prev) => ({ ...prev, [String(activeDayIndex)]: { guesses, status } }))
    return { status, attempts: guesses.length }
  }
```

- [ ] **Step 3: Update the return statement**

Change the final `return` of `useGameState` from:

```ts
  return {
    dayIndex: activeDayIndex,
    todayIndex,
    isToday,
    logo,
    guesses: dayRecord.guesses,
    status: dayRecord.status,
    submitGuess,
    viewDay,
    returnToToday,
    resetDay,
    archiveOpen,
    toggleArchive: () => setArchiveOpen((v) => !v),
    dark,
    toggleDark,
    soundEnabled,
    toggleSound,
    history,
    foundLogos,
    streak,
    maxTries: MAX_TRIES,
  }
}
```

to:

```ts
  return {
    dayIndex: activeDayIndex,
    todayIndex,
    isToday,
    bank: bank ?? [],
    bankError,
    logo,
    guesses: dayRecord.guesses,
    status: dayRecord.status,
    submitGuess,
    viewDay,
    returnToToday,
    resetDay,
    archiveOpen,
    toggleArchive: () => setArchiveOpen((v) => !v),
    dark,
    toggleDark,
    soundEnabled,
    toggleSound,
    history,
    foundLogos,
    streak,
    maxTries: MAX_TRIES,
  }
}
```

`viewDay`, `returnToToday`, `resetDay` (defined further down in the file) are unchanged — leave them as-is.

- [ ] **Step 4: Manual verification**

This hook has no consumer changes yet (Task 6 does that), so the app won't compile cleanly in isolation (`index.tsx` still expects `g.logo: Logo` non-null and doesn't know about `g.bank`) — that's expected and resolved by Task 6. Nothing to click through yet; just confirm the diff matches the shape above.

---

### Task 6: `routes/index.tsx` — loading state and bank threading

**Files:**
- Modify: `apps/web/src/routes/index.tsx`

**Interfaces:**
- Consumes: `useGameState()`'s new return shape from Task 5 (`logo: Logo | null`, `bank: Logo[]`, `bankError: string | null`).
- Produces: gates the entire game UI behind `g.logo !== null`; passes `bank={g.bank}` to `ArchivePanel` and `PhysicsLogoPile` (props added in Task 7's `ArchivePanel`/`PhysicsLogoPile` changes — do this task and Task 7 together if executing out of order causes a type error, since they're two ends of the same prop wiring).

- [ ] **Step 1: Add the loading/error gate and pass `bank` down**

Modify `apps/web/src/routes/index.tsx`. Change the `Home` function from:

```tsx
function Home() {
  const g = useGameState();
  const isPlaying = g.status === "playing";
  const pileRef = useRef<PhysicsLogoPileHandle>(null);
  const { playClick, playWrongGuess, playWin, playLose } = useSoundEffects(
    g.soundEnabled,
  );

  function handleGuess(text: string) {
    const result = g.submitGuess(text);
    if (result?.status === "won") {
      playWin();
      pileRef.current?.launchWin(g.maxTries + 1 - result.attempts);
    } else if (result?.status === "lost") {
      playLose();
    } else if (result?.status === "playing") {
      playWrongGuess();
    }
  }

  function handleFakeLaunch() {
    pileRef.current?.launchWin(g.maxTries);
  }

  function handleAddRandomLogos() {
    pileRef.current?.addRandomLogos(10);
  }

  function handleResetPileToFound() {
    pileRef.current?.resetToFound();
  }

  return (
    <>
      <PhysicsLogoPile
        ref={pileRef}
        dayIndex={g.dayIndex}
        logo={g.logo}
        foundLogos={g.foundLogos}
      />
      <div className={shared.page}>
        <div className={styles.headerWrap}>
          <GameHeader
            onToggleArchive={g.toggleArchive}
            dark={g.dark}
            onToggleDark={g.toggleDark}
            soundEnabled={g.soundEnabled}
            onToggleSound={g.toggleSound}
            playClick={playClick}
          />
          <ArchivePanel
            open={g.archiveOpen}
            dayIndex={g.todayIndex}
            activeDayIndex={g.dayIndex}
            history={g.history}
            onSelectDay={g.viewDay}
          />
        </div>
```

to:

```tsx
function Home() {
  const g = useGameState();
  const pileRef = useRef<PhysicsLogoPileHandle>(null);
  const { playClick, playWrongGuess, playWin, playLose } = useSoundEffects(
    g.soundEnabled,
  );

  function handleGuess(text: string) {
    const result = g.submitGuess(text);
    if (result?.status === "won") {
      playWin();
      pileRef.current?.launchWin(g.maxTries + 1 - result.attempts);
    } else if (result?.status === "lost") {
      playLose();
    } else if (result?.status === "playing") {
      playWrongGuess();
    }
  }

  function handleFakeLaunch() {
    pileRef.current?.launchWin(g.maxTries);
  }

  function handleAddRandomLogos() {
    pileRef.current?.addRandomLogos(10);
  }

  function handleResetPileToFound() {
    pileRef.current?.resetToFound();
  }

  if (!g.logo) {
    return (
      <div className={shared.page}>
        <main className={shared.gameArea} id="main">
          <p>{g.bankError ? `Failed to load logos: ${g.bankError}` : "Loading…"}</p>
        </main>
      </div>
    );
  }

  const isPlaying = g.status === "playing";

  return (
    <>
      <PhysicsLogoPile
        ref={pileRef}
        dayIndex={g.dayIndex}
        logo={g.logo}
        foundLogos={g.foundLogos}
        bank={g.bank}
      />
      <div className={shared.page}>
        <div className={styles.headerWrap}>
          <GameHeader
            onToggleArchive={g.toggleArchive}
            dark={g.dark}
            onToggleDark={g.toggleDark}
            soundEnabled={g.soundEnabled}
            onToggleSound={g.toggleSound}
            playClick={playClick}
          />
          <ArchivePanel
            open={g.archiveOpen}
            dayIndex={g.todayIndex}
            activeDayIndex={g.dayIndex}
            history={g.history}
            onSelectDay={g.viewDay}
            bank={g.bank}
          />
        </div>
```

The rest of the function (the `<main>` block with `LogoCard`, `GuessTiles`, `GuessForm`, `RevealPanel`, `DevtoolsPanel`) is unchanged, except `GuessForm` needs one more prop — change:

```tsx
              {isPlaying && (
                <GuessForm
                  key={g.dayIndex}
                  onSubmit={handleGuess}
                  logo={g.logo}
                  attemptCount={g.guesses.length}
                />
              )}
```

to:

```tsx
              {isPlaying && (
                <GuessForm
                  key={g.dayIndex}
                  onSubmit={handleGuess}
                  logo={g.logo}
                  attemptCount={g.guesses.length}
                  bank={g.bank}
                />
              )}
```

- [ ] **Step 2: Manual verification**

Nothing compiles cleanly until Task 7 adds the `bank` prop to `ArchivePanel`, `PhysicsLogoPile`, and `GuessForm` — do Task 7 immediately after this one, then verify both together: run `pnpm dev`, confirm the game shows "Loading…" briefly then the puzzle appears, and that guessing, the archive panel, and the physics pile all still work exactly as before.

---

### Task 7: Swap `LOGOS` imports for a `bank` prop in `GuessForm`, `ArchivePanel`, `PhysicsLogoPile`

**Files:**
- Modify: `apps/web/src/components/GuessForm.tsx`
- Modify: `apps/web/src/components/ArchivePanel.tsx`
- Modify: `apps/web/src/components/PhysicsLogoPile.tsx`

**Interfaces:**
- Consumes: `bank: Logo[]` passed from `index.tsx` (Task 6).
- Produces: none of these components import `LOGOS` from `@slogodle/logos` anymore — only the `Logo` type.

- [ ] **Step 1: `GuessForm.tsx`**

Change:

```tsx
import { useRef, useState } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { LOGOS, type Logo } from '@slogodle/logos'
import { suggestionsFor } from '../lib/game-logic'
import { m } from '../paraglide/messages.js'
import { GuessHints } from './GuessHints'
import { GuessSuggestions } from './GuessSuggestions'
import styles from './GuessForm.module.css'

interface GuessFormProps {
  onSubmit: (text: string) => void
  logo: Logo
  attemptCount: number
}

export function GuessForm({ onSubmit, logo, attemptCount }: GuessFormProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  // base-ui fires onInputValueChange with the picked label right after onValueChange;
  // this ref swallows that one call so the input doesn't flash the label before clearing.
  const suppressNextInputValueRef = useRef<string | null>(null)
  const suggestions = suggestionsFor(value, LOGOS, null)
```

to:

```tsx
import { useRef, useState } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import type { Logo } from '@slogodle/logos'
import { suggestionsFor } from '../lib/game-logic'
import { m } from '../paraglide/messages.js'
import { GuessHints } from './GuessHints'
import { GuessSuggestions } from './GuessSuggestions'
import styles from './GuessForm.module.css'

interface GuessFormProps {
  onSubmit: (text: string) => void
  logo: Logo
  attemptCount: number
  bank: Logo[]
}

export function GuessForm({ onSubmit, logo, attemptCount, bank }: GuessFormProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  // base-ui fires onInputValueChange with the picked label right after onValueChange;
  // this ref swallows that one call so the input doesn't flash the label before clearing.
  const suppressNextInputValueRef = useRef<string | null>(null)
  const suggestions = suggestionsFor(value, bank, null)
```

- [ ] **Step 2: `ArchivePanel.tsx`**

Change:

```tsx
import { LOGOS } from '@slogodle/logos'
import { pickLogo, type GameStatus } from '../lib/game-logic'
import { m } from '../paraglide/messages.js'
import styles from './ArchivePanel.module.css'

const ARCHIVE_DAYS = 5

interface ArchivePanelProps {
  open: boolean
  dayIndex: number
  activeDayIndex: number
  history: Record<string, GameStatus>
  onSelectDay: (dayIndex: number) => void
}

export function ArchivePanel({ open, dayIndex, activeDayIndex, history, onSelectDay }: ArchivePanelProps) {
```

to:

```tsx
import type { Logo } from '@slogodle/logos'
import { pickLogo, type GameStatus } from '../lib/game-logic'
import { m } from '../paraglide/messages.js'
import styles from './ArchivePanel.module.css'

const ARCHIVE_DAYS = 5

interface ArchivePanelProps {
  open: boolean
  dayIndex: number
  activeDayIndex: number
  history: Record<string, GameStatus>
  onSelectDay: (dayIndex: number) => void
  bank: Logo[]
}

export function ArchivePanel({ open, dayIndex, activeDayIndex, history, onSelectDay, bank }: ArchivePanelProps) {
```

And further down in the same function, change:

```tsx
    const name = result === 'won' || result === 'lost' ? pickLogo(LOGOS, idx).name : null
```

to:

```tsx
    const name = result === 'won' || result === 'lost' ? pickLogo(bank, idx).name : null
```

- [ ] **Step 3: `PhysicsLogoPile.tsx`**

Change the imports and props interface from:

```tsx
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import { flushSync } from "react-dom";
import { LOGOS, type Logo } from "@slogodle/logos";
import {
  createLogoPileSimulation,
  type LogoPileSimulation,
} from "../lib/physicsLogoPile";
import { getStickerIconSrc } from "../lib/stickerIcons";
import styles from "./PhysicsLogoPile.module.css";

const STICKER_LOGOS = import.meta.env.VITE_STICKER_LOGOS !== "false";

export interface PhysicsLogoPileHandle {
  /** Flings `count` copies of today's logo in from a random screen edge. */
  launchWin(count: number): void;
  /** Flings `count` random logos in from a random screen edge, purely visual. */
  addRandomLogos(count: number): void;
  /** Clears any launched (win or random) logos, leaving only the found ones. */
  resetToFound(): void;
}

interface PhysicsLogoPileProps {
  dayIndex: number;
  logo: Logo;
  foundLogos: { dayIndex: number; logo: Logo; count: number }[];
  ref?: Ref<PhysicsLogoPileHandle>;
}
```

to:

```tsx
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import { flushSync } from "react-dom";
import type { Logo } from "@slogodle/logos";
import {
  createLogoPileSimulation,
  type LogoPileSimulation,
} from "../lib/physicsLogoPile";
import { getStickerIconSrc } from "../lib/stickerIcons";
import styles from "./PhysicsLogoPile.module.css";

const STICKER_LOGOS = import.meta.env.VITE_STICKER_LOGOS !== "false";

export interface PhysicsLogoPileHandle {
  /** Flings `count` copies of today's logo in from a random screen edge. */
  launchWin(count: number): void;
  /** Flings `count` random logos in from a random screen edge, purely visual. */
  addRandomLogos(count: number): void;
  /** Clears any launched (win or random) logos, leaving only the found ones. */
  resetToFound(): void;
}

interface PhysicsLogoPileProps {
  dayIndex: number;
  logo: Logo;
  foundLogos: { dayIndex: number; logo: Logo; count: number }[];
  bank: Logo[];
  ref?: Ref<PhysicsLogoPileHandle>;
}
```

Then change the function signature and the `addRandomLogos` handle method. From:

```tsx
export function PhysicsLogoPile({
  dayIndex,
  logo,
  foundLogos,
  ref,
}: PhysicsLogoPileProps) {
```

to:

```tsx
export function PhysicsLogoPile({
  dayIndex,
  logo,
  foundLogos,
  bank,
  ref,
}: PhysicsLogoPileProps) {
```

And from:

```tsx
      addRandomLogos(count) {
        const sim = simRef.current;
        if (!sim) return;
        const side: "left" | "right" = Math.random() < 0.5 ? "left" : "right";
        const batchId = launchBatchRef.current++;
        const newSlots: PileSlot[] = Array.from({ length: count }, (_, i) => {
          const random = LOGOS[Math.floor(Math.random() * LOGOS.length)];
          return {
            slotKey: `random-${batchId}-${i}`,
            name: random.name,
            icon: random.icon,
            aspect: random.aspect,
          };
        });
        flushSync(() => setLaunchSlots((prev) => [...prev, ...newSlots]));
        sim.launchFromSide(
          newSlots.map((s) => ({ key: s.slotKey, aspect: s.aspect })),
          side,
        );
      },
      resetToFound() {
        const sim = simRef.current;
        if (!sim) return;
        sim.removeAllExcept(initialSlots.map((s) => s.slotKey));
        setLaunchSlots([]);
      },
    }),
    [logo, initialSlots],
  );
```

to:

```tsx
      addRandomLogos(count) {
        const sim = simRef.current;
        if (!sim || bank.length === 0) return;
        const side: "left" | "right" = Math.random() < 0.5 ? "left" : "right";
        const batchId = launchBatchRef.current++;
        const newSlots: PileSlot[] = Array.from({ length: count }, (_, i) => {
          const random = bank[Math.floor(Math.random() * bank.length)];
          return {
            slotKey: `random-${batchId}-${i}`,
            name: random.name,
            icon: random.icon,
            aspect: random.aspect,
          };
        });
        flushSync(() => setLaunchSlots((prev) => [...prev, ...newSlots]));
        sim.launchFromSide(
          newSlots.map((s) => ({ key: s.slotKey, aspect: s.aspect })),
          side,
        );
      },
      resetToFound() {
        const sim = simRef.current;
        if (!sim) return;
        sim.removeAllExcept(initialSlots.map((s) => s.slotKey));
        setLaunchSlots([]);
      },
    }),
    [logo, initialSlots, bank],
  );
```

(The `bank.length === 0` guard covers the moment right after load if `addRandomLogos` were ever called before the bank arrives — in practice `DevtoolsPanel`'s button that triggers this isn't reachable until the loading gate in Task 6 has already passed, but the guard costs nothing and avoids a crash if that ever changes.)

- [ ] **Step 4: Manual verification**

Run `pnpm dev` (or ask the project owner to) and walk through:
1. The game loads (past the "Loading…" state) and shows today's puzzle with its real icon rendered via `/api/logos/...`.
2. Type a guess — autocomplete suggestions appear and are drawn from the real bank (not the old local `LOGOS`).
3. Guess correctly — the win animation launches copies of the correct icon into the physics pile; the sticker outline renders correctly (confirms same-origin image loading works for the canvas-based effect).
4. Open the archive panel — past days (if any) show the correct logo name.
5. In dev mode, use the devtools panel's "add random logos" action — random decorative icons appear in the pile, sourced from the real bank.

This is the full feature — after this task, the game no longer depends on `@slogodle/logos`' `LOGOS` array at runtime (only its `Logo` type, and `packages/logos` remains the authoring/staging source per the design).
