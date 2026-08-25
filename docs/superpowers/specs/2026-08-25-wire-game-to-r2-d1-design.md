# Wire the game to R2 and D1

Status: approved, pre-implementation
Date: 2026-08-25

## Context

The admin page (`/admin`, dev-only) already reads logo icons from R2 and metadata
from D1, via the AWS S3 SDK (signed URLs, account keys) and Cloudflare's D1 REST
API (account id + API token) respectively. Both are dev-only, credential-based,
and never touch a real Cloudflare Worker binding.

The actual game (`/`) still reads everything from the local `@slogodle/logos`
package: a static `LOGOS: Logo[]` array, with icons served as static SVGs from
`public/logos/`. `LOGOS`'s array position is the literal source of truth for
which logo appears on which day (`pickLogo(LOGOS, dayIndex)` in
`src/lib/game-logic.ts`); a `shuffle-logos.mjs` script exists solely to
re-randomize that array order.

Goal: make the live game read logos and metadata from R2/D1 instead, using
production-appropriate Cloudflare Worker bindings rather than the admin page's
dev-only REST/S3 approach.

Confirmed with the project owner: the game is pre-launch with no real player
data yet, so there is no requirement to preserve the exact current
day-index-to-logo mapping across the cutover.

## Decisions made during brainstorming

1. **Runtime access:** switch to native Cloudflare Worker bindings (D1 binding
   already declared as `DB`; add an R2 binding). Requires adding
   `@cloudflare/vite-plugin` so local dev (`vite dev`) also gets real bindings
   via Miniflare/workerd, matching production.
2. **Day ordering:** add an explicit `day_order` column to `logo_metadata`,
   admin-managed going forward, rather than relying on D1 row id/insertion
   order.
3. **Local package fate:** `packages/logos` (the `LOGOS` array, `public/logos`
   SVGs, and the `slogodle-add-logo` skill) stays as the *authoring* source.
   New logos are still added there first, then pushed to R2/D1 via
   `sync-logos.ts`. The live game never reads `packages/logos` at runtime —
   it's a staging format only.

## Architecture

### Bindings

`wrangler.jsonc` gets a new R2 binding alongside the existing D1 one:

```jsonc
"r2_buckets": [
  { "binding": "LOGO_BUCKET", "bucket_name": "logos" }
]
```

(`logos` is the existing bucket name, confirmed from `.env`'s `R2_BUCKET` value
used by the admin page's S3-SDK client today.)

Server-side code accesses both via the built-in `cloudflare:workers` module,
with no manual threading through `server.ts`'s `fetch(request, env, ctx)`:

```ts
import { env } from "cloudflare:workers";

const rows = await env.DB.prepare("SELECT * FROM logo_metadata ...").all();
const object = await env.LOGO_BUCKET.get(key);
```

This works inside `createServerFn` handlers (deep in the call stack, after a
request has started) — the "I/O not allowed" restriction only applies at raw
top-level module scope. (Cloudflare TanStack Start guide; Cloudflare changelog
"Import env to access bindings", 2025-03-17.)

`@cloudflare/vite-plugin` is added to `vite.config.ts`, ordered before
`tanstackStart()` per TanStack's own `examples/react/start-basic-cloudflare`:

```ts
import { cloudflare } from '@cloudflare/vite-plugin'
// ...
plugins: [
  cloudflare({ viteEnvironment: { name: 'ssr' } }),
  tsConfigPaths(...),
  paraglideVitePlugin(...),
  tanstackStart(),
  viteReact(),
  babel(...),
]
```

This only changes what `vite dev` runs on (real workerd instead of plain
Node); the build/deploy flow (`vite build`, `wrangler deploy` against
`dist/server/server.js`) is unaffected. Add a `cf-typegen` script
(`wrangler types`) to generate a typed `Env` from `wrangler.jsonc`.

### Day ordering (D1 schema)

New migration `0002_add_day_order.sql`:

```sql
ALTER TABLE logo_metadata ADD COLUMN day_order INTEGER;
UPDATE logo_metadata SET day_order = id WHERE day_order IS NULL;
CREATE UNIQUE INDEX idx_logo_metadata_day_order ON logo_metadata(day_order);
```

Backfilling `day_order = id` is a faithful reproduction of today's order,
since `sync-logos.ts` inserts rows in `LOGOS` array order and `id` is
autoincrement — though exact continuity doesn't matter yet since there's no
live player data.

`sync-logos.ts` is updated so newly-inserted rows get
`day_order = (SELECT COALESCE(MAX(day_order), 0) + 1 FROM logo_metadata)`,
appending new logos to the end of the day rotation automatically, matching
today's "append to the end of the array" behavior.

`shuffle-logos.mjs` is **not** touched or replaced in this change — it will
keep reordering the local package harmlessly, but will no longer affect the
live game's day rotation once this ships. Noted as a known follow-up (a
D1-native reshuffle script), not solved here.

### Image serving

`src/server.ts`'s Worker `fetch` handler gets a short-circuit before
delegating to the TanStack Start handler:

```ts
import { env } from "cloudflare:workers"

const LOGO_ROUTE = /^\/api\/logos\/([^/]+)$/

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const match = url.pathname.match(LOGO_ROUTE)
    if (match) {
      const object = await env.LOGO_BUCKET.get(match[1])
      if (!object) return new Response('Not found', { status: 404 })
      return new Response(object.body, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }
    return paraglideMiddleware(request, () => handler.fetch(request))
  },
}
```

Same-origin, so `stickerIcons.ts`'s canvas-based sticker baking keeps working
without any CORS configuration on the bucket. `Cache-Control` is safe as
`immutable` because `sync-logos.ts` never overwrites an existing R2 object.

Explicitly deferred: Cloudflare edge/CDN-level caching of this route via the
Cache API. Browser caching via `Cache-Control` is sufficient for v1.

### Data flow

New `src/lib/game-logos.server.ts`:

```ts
export async function listGameLogos(): Promise<Logo[]> {
  const rows = await env.DB.prepare(
    `SELECT * FROM logo_metadata
     WHERE name IS NOT NULL AND industry IS NOT NULL AND founded IS NOT NULL
       AND description IS NOT NULL AND fun_fact IS NOT NULL
       AND git_link IS NOT NULL AND aspect IS NOT NULL AND day_order IS NOT NULL
     ORDER BY day_order`
  ).all()
  return rows.results.map(toLogo)
}
```

Rows with any required field still null (an admin entry in progress) are
excluded from the live bank — never crash the game, just aren't playable yet.
`toLogo` maps D1's snake_case row shape (`fun_fact`, `git_link`, `r2_key`,
...) to the existing `Logo` interface from `@slogodle/logos`
(`funFact`, `gitLink`, `icon`, ...) — the same camelCase conversion
`logo-metadata.server.ts`'s `toLogoMetadata` already does for the admin page
— with `icon` additionally rewritten from `r2_key` to `/api/logos/{r2_key}`.
Reusing the existing `Logo` type means every component that only imports
`type Logo` (`GuessHints`, `LogoCard`, `RevealPanel`) needs zero changes.

New `src/lib/game-logos.ts` exposes this via `createServerFn`
(`fetchGameLogos`), mirroring the existing `fetchR2Logos` / `fetchLogoMetadata`
pattern used by admin.

### Client-side wiring

The `/` route is already `ssr: false`, so this is a plain client-side fetch on
mount, not an SSR loader concern.

`useGameState` fetches the bank once via `fetchGameLogos()` in a `useEffect`
and holds `bank: Logo[] | null`. While `bank` is `null`, the hook reports a
`loading: true` state; `Home` (`routes/index.tsx`) renders a minimal loading
state instead of the game UI (comparable to admin's "Loading…" — no new
design work). Once loaded, `pickLogo(bank, dayIndex)` replaces
`pickLogo(LOGOS, dayIndex)`, and the returned `bank` is passed down as a prop
to:

- `GuessForm` (autocomplete suggestions: `suggestionsFor(value, bank, null)`)
- `ArchivePanel` (reconstructing past days' logo names)
- `PhysicsLogoPile` (`addRandomLogos`'s decorative random selection)

`PhysicsLogoPile`, `ArchivePanel`, and `GuessForm` currently `import { LOGOS }
from '@slogodle/logos'` directly — each swaps that import for a new `bank:
Logo[]` prop. No other structural change to these components.

## File-by-file change list

- `wrangler.jsonc` — add `r2_buckets` binding.
- `vite.config.ts` — add `@cloudflare/vite-plugin`.
- `package.json` — add `@cloudflare/vite-plugin` dependency; add `cf-typegen` script.
- `migrations/0002_add_day_order.sql` — new migration.
- `scripts/sync-logos.ts` — assign `day_order` on insert.
- `src/server.ts` — add the `/api/logos/:key` short-circuit route.
- `src/lib/game-logos.server.ts` — new: `listGameLogos()`.
- `src/lib/game-logos.ts` — new: `fetchGameLogos` server fn.
- `src/hooks/useGameState.ts` — fetch bank, add loading state, replace `LOGOS` with `bank`.
- `src/routes/index.tsx` — handle loading state, pass `bank` prop down.
- `src/components/GuessForm.tsx` — `bank` prop instead of `LOGOS` import.
- `src/components/ArchivePanel.tsx` — `bank` prop instead of `LOGOS` import.
- `src/components/PhysicsLogoPile.tsx` — `bank` prop instead of `LOGOS` import.

No changes to: `src/lib/game-logic.ts`, `src/components/GuessHints.tsx`,
`src/components/LogoCard.tsx`, `src/components/RevealPanel.tsx` (all consume
`Logo`/props only, never the `LOGOS` array itself), `packages/logos/*`,
`src/routes/admin.tsx` and its `.server.ts` files.

## Explicitly out of scope (follow-ups, not this change)

- Migrating admin's R2/D1 access from REST-API/S3-SDK to native bindings
  (now technically possible since dev gets real bindings too, but admin isn't
  broken today — separate cleanup).
- A D1-native replacement for `shuffle-logos.mjs`.
- Edge/CDN-level caching of `/api/logos/:key` via the Cache API.

## Testing

- `pnpm dev` after adding `@cloudflare/vite-plugin` must still boot and serve
  the game; verify bindings are actually reachable (e.g. a temporary console
  log of `env.DB` presence) before wiring real queries.
- Manually play a full day (guess correctly, guess incorrectly x3, reveal
  panel, share text, GitHub link) against D1/R2-backed data.
- Verify the physics pile (both the win launch and `addRandomLogos` devtools
  action) renders correctly with `/api/logos/:key`-sourced icons, including
  the sticker effect (canvas taint check — same-origin should just work).
- Verify the archive panel shows correct past-day names.
- Verify a `logo_metadata` row with a missing required field is excluded from
  the live bank (doesn't crash `pickLogo`/the game).
