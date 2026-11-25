# Multi-brand Slogodle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One `apps/web` codebase that builds and deploys as several brand apps (`tech` today, a second brand next), selected by the build-time env variable `VARIANT`, sharing one D1 database and one account system but with separate progress, logos and R2 buckets per brand.

**Architecture:** A typed brand-config module is resolved once at build time (Vite `define` of `VARIANT`) and read by both client and Worker code. Game tables get a `brand` column; every game query goes through one helper that injects the brand scope. Each brand is a Wrangler environment (own Worker, route, R2 bucket, secrets) bound to the same D1; the login cookie is scoped to `.slogodle.com`.

**Tech Stack:** TanStack Start on Cloudflare Workers, D1, R2, better-auth (+ drizzle adapter), paraglide, Vite 8 + `@cloudflare/vite-plugin`, vitest, pnpm/turbo, oxlint/oxfmt.

**Spec:** `docs/superpowers/specs/2026-11-19-multi-brand-design.md`

## Global Constraints

- Env variable name is `VARIANT`, read at **build time**; values: `tech` (default for dev/test when unset) and `brand` (placeholder id for the second brand). An unknown value fails the build/boot loudly.
- Column is named `brand TEXT NOT NULL DEFAULT 'tech'` on `progress`, `speed_run`, `logo_metadata` only. Auth tables are untouched.
- One shared D1 (`DB`, `database_id` d993c41e-9dc1-4065-aa03-7988fca0ff06); one R2 bucket per brand bound as `LOGO_BUCKET`; tech keeps bucket `logos` and Worker `tech-slogodle`.
- Login cookie domain `.slogodle.com`, same `BETTER_AUTH_SECRET` on every deployment; each deployment has its own `BETTER_AUTH_URL`. A one-time forced re-login is accepted.
- Admin stays scoped to the current brand only; `ADMIN_EMAIL` is shared.
- Out of scope, do not touch: `apps/landing`, `apps/video`, `packages/logos`, the Buffer/video publishing flow.
- `git_link` keeps its column and name; it becomes optional per brand (no rename, no data migration).
- Commit messages use the repo's gitmoji style (e.g. `🚀 add CI`) and end with the attribution line from the session.
- Existing `pnpm test` and `pnpm exec oxlint` must keep passing after every task.

## Review Focus

1. A user playing the same `day_index` on both brands gets two independent progress / speed rows (no unique-index clash, no cross-read) — pinned in Tasks 2 and 3.
2. A brand with an **empty** logo bank (new brand's bucket starts empty) must not crash the home page, speed mode, `syncDay`, stats or mistakes (`pickLogo` divides by `bank.length`) — pinned in Task 4.
3. `VARIANT` unset (dev/vitest) falls back to `tech`; an unknown value throws a clear error — pinned in Task 1.
4. `claimAnon` on brand B must not move or delete brand A's anonymous rows — pinned in Task 3.
5. A game query written without the brand scope must be impossible to ship unnoticed — pinned in Task 2 (helper throws; source-scan test).

---

## File Structure

- Create `apps/web/src/brands/index.ts` — `Brand` type, `BRANDS` map, `getBrand(id)`, active `brand` export.
- Create `apps/web/src/brands/brands.test.ts`.
- Create `apps/web/src/lib/brand-db.server.ts` — `brandSql`, `prepareScoped`, `BRAND_ID`.
- Create `apps/web/src/lib/brand-db.test.ts` — helper tests + source-scan guard.
- Create `apps/web/migrations/0009_add_brand.sql`.
- Modify `vite.config.ts`, `vitest.config.ts`, `src/env.d.ts` (or a new `src/vite-env-variant.d.ts`) — `__VARIANT__` define + type.
- Modify the query modules: `progress.server.ts`, `speed.server.ts`, `stats.server.ts`, `mistakes.server.ts`, `game-logos.server.ts`, `logo-metadata.server.ts`, `users.server.ts`.
- Modify `game-logic.ts` (epoch from brand), `auth.server.ts`, `server.ts` (no change expected), `routes/__root.tsx`, brand-named strings found by grep, `wrangler.jsonc`, `package.json` scripts, `.github/workflows/ci.yml`, `README.md`.

---

### Task 1: Brand config and build-time `VARIANT`

**Files:**
- Create: `apps/web/src/brands/index.ts`, `apps/web/src/brands/brands.test.ts`
- Modify: `apps/web/vite.config.ts`, `apps/web/vitest.config.ts`, `apps/web/src/env.d.ts`

**Interfaces:**
- Produces:
  - `export interface Brand { id: string; name: string; origin: string; epoch: [year: number, monthIndex: number, day: number]; themeColor: string; requiresGitLink: boolean; shareNoun: string }` (`shareNoun` replaces the hard-coded "tech" in "I found today's tech logo!").
  - `export const BRANDS: Record<string, Brand>`; `export function getBrand(id: string | undefined): Brand` (undefined → `tech`; unknown → throws `Error("Unknown VARIANT \"x\" (expected one of: tech, brand)")`).
  - `export const brand: Brand` = `getBrand(__VARIANT__)`.
  - global `declare const __VARIANT__: string | undefined`.

- [ ] **Step 1: Write failing tests in `brands.test.ts`**: `getBrand(undefined).id === "tech"`; `getBrand("brand").id === "brand"`; `getBrand("nope")` toThrow matching `/Unknown VARIANT "nope"/`; tech entry has `origin === "https://tech.slogodle.com"`, `epoch` `[2026, 9, 5]`, `themeColor "#f4a6c6"`, `requiresGitLink true`; `brand` entry `requiresGitLink false`, `origin "https://brand.slogodle.com"`.
- [ ] **Step 2: Run** `pnpm --filter web test -- brands` → FAIL (module missing).
- [ ] **Step 3: Implement `src/brands/index.ts`.** Tech values come from the code today (`SITE_URL` and theme-color in `routes/__root.tsx`, `EPOCH` in `game-logic.ts`, `m.site_title()` name "Slogodle"). The `brand` entry is a **placeholder** (owner fills real name/colors later): copy tech's name/themeColor, `epoch [2026, 10, 19]`, `shareNoun "brand"`.
- [ ] **Step 4: Add `define: { __VARIANT__: JSON.stringify(process.env.VARIANT) }` to `vite.config.ts` and the same to `vitest.config.ts`** (`JSON.stringify(undefined)` yields `undefined`, which is what `getBrand` expects). Declare `__VARIANT__` in `src/env.d.ts`. Validate eagerly: importing `brand` must throw at build/boot for an unknown value.
- [ ] **Step 5: Run** `pnpm --filter web test -- brands` → PASS; run `VARIANT=nope pnpm --filter web build` → fails with the "Unknown VARIANT" message.
- [ ] **Step 6: Commit** `✨ add brand config and VARIANT build variable`.

---

### Task 2: Migration `0009_add_brand` and the brand-scope helper

**Files:**
- Create: `apps/web/migrations/0009_add_brand.sql`, `apps/web/src/lib/brand-db.server.ts`, `apps/web/src/lib/brand-db.test.ts`

**Interfaces:**
- Consumes: `brand` from Task 1.
- Produces:
  - `export const BRAND_ID: string` (= `brand.id`).
  - `export function brandSql(sql: string, brandId?: string): string` — replaces every `$BRAND` token with the SQL string literal of the brand id (`'tech'`); throws `Error("game query is missing the $BRAND scope")` when the token is absent; throws if the id isn't `/^[a-z0-9-]+$/`.
  - `export function prepareScoped(sql: string): D1PreparedStatement` = `env.DB.prepare(brandSql(sql))`.
  - Query convention for Tasks 3–5: write `WHERE brand = $BRAND` (reads/updates/deletes) and `INSERT … (brand, …) VALUES ($BRAND, …)`; every statement touching `progress`, `speed_run` or `logo_metadata` goes through `prepareScoped`.

- [ ] **Step 1: Write failing helper tests** (`brand-db.test.ts`): `brandSql("SELECT 1 WHERE brand = $BRAND", "tech")` equals `"SELECT 1 WHERE brand = 'tech'"`; two tokens both replaced; no token → toThrow `/\$BRAND/`; id `"x'; DROP"` → toThrow. **Source-scan guard test:** read the seven query modules from Task 3–5 with `node:fs`, and assert none contains `env.DB.prepare(` outside `brand-db.server.ts` except statements on `user`/`session` only (assert on an explicit allowlist: `users.server.ts` may call `env.DB.prepare` only for the `user`-table count/list queries — write the allowlist as the list of file+snippet pairs, and fail with the offending file name).
- [ ] **Step 2: Run** `pnpm --filter web test -- brand-db` → FAIL.
- [ ] **Step 3: Implement `brand-db.server.ts`** per the interface above.
- [ ] **Step 4: Write `0009_add_brand.sql`.** Requirements:
  - `ALTER TABLE progress|speed_run ADD COLUMN brand TEXT NOT NULL DEFAULT 'tech'` (existing rows backfill automatically).
  - Drop and recreate the unique indexes with `brand`: `progress_anon_day_unique (anon_id, brand, day_index)`, `progress_user_day_unique (user_id, brand, day_index)`, `speed_run_anon_day_unique (anon_id, brand, day_index, is_replay)`, `speed_run_user_day_unique (user_id, brand, day_index, is_replay)` (keep the existing `WHERE … IS NOT NULL` predicates); recreate `speed_run_ladder_idx` as `(brand, day_index, score_ms)`.
  - `logo_metadata`: inline `r2_key TEXT NOT NULL UNIQUE` can't be altered, so rebuild the table (copy preserving `id` — `progress.logo_id` references it) with `brand` added, `UNIQUE (brand, r2_key)`, and `idx_logo_metadata_day_order` recreated as unique on `(brand, day_order)`. Use `PRAGMA defer_foreign_keys = on` around the swap.
  - Known limit (document in the file header): between running this migration and deploying the new code, the old admin logo upsert (`ON CONFLICT(r2_key)`) errors; game play keeps working. Deploy right after migrating.
- [ ] **Step 5: Verify the migration on a scratch DB** (not production): build a scratch SQLite file from `apps/web/migrations/0001…0008` plus a few user/progress/speed_run/logo_metadata rows, apply `0009`, then with the `sqlite3` CLI check: existing rows have `brand='tech'`; inserting the same `(user_id, day_index)` progress row with `brand='brand'` succeeds and with `brand='tech'` fails; `progress.logo_id` values still resolve in `logo_metadata`; `PRAGMA foreign_key_check` is empty. Also run `wrangler d1 migrations apply slogodle --local` if a local D1 is available.
- [ ] **Step 6: Run** helper tests → PASS (the source-scan test stays red until Tasks 3–5 finish; mark it `it.skip`-free but run it at the end of Task 5 — if committing earlier, scope the scan to modules already converted).
- [ ] **Step 7: Commit** `🗃️ add brand column migration and brand scope helper`.

---

### Task 3: Scope progress and speed queries

**Files:**
- Modify: `apps/web/src/lib/progress.server.ts`, `apps/web/src/lib/speed.server.ts`, `apps/web/src/lib/game-logic.ts`
- Test: `apps/web/src/lib/game-logic.test.ts`, `apps/web/src/lib/speed.test.ts` (extend)

**Interfaces:**
- Consumes: `prepareScoped`, `BRAND_ID` (Task 2), `brand.epoch` (Task 1).
- Produces: `dayIndexFor(date, epoch = brandEpoch())` where the default epoch is `new Date(...brand.epoch)` (month index as given). Server-function signatures in `progress.server.ts` / `speed.server.ts` are unchanged.

- [ ] **Step 1: Write failing tests in `game-logic.test.ts`:** with the default tech brand, `dayIndexFor(new Date(2026, 9, 5)) === 0` and `dayIndexFor(new Date(2026, 9, 6)) === 1` (unchanged behavior); `dayIndexFor(new Date(2026, 10, 19), new Date(...getBrand("brand").epoch)) === 0`.
- [ ] **Step 2: Run** `pnpm --filter web test -- game-logic` → FAIL on the new brand-epoch case only.
- [ ] **Step 3: Replace the module-level `EPOCH` in `game-logic.ts`** with the brand's epoch (client and server both import this, so the define from Task 1 serves both).
- [ ] **Step 4: Convert every statement in `progress.server.ts` and `speed.server.ts`** to `prepareScoped` with the `$BRAND` convention: `syncDay` insert writes `brand`; `claimAnon`'s four statements (delete/update on `progress` and `speed_run`) filter `brand = $BRAND` so a claim on one brand never touches another brand's rows; `myProgress`, `findRun`, `startSpeedRun`, `finishSpeedRun` update, ladder/standing/leaderboard queries (`speed.server.ts` lines ~235–330, including the `speed_run o` subqueries and the `LEFT JOIN user`) all filter `brand = $BRAND`. Statements on `user` only are left alone.
- [ ] **Step 5: Extend `speed.test.ts` / add a test** asserting that every SQL string issued by these modules contains the scope: mock `prepareScoped` (vitest module mock) to capture SQL and run `claimAnon`, `startSpeedRun`, `myProgress` against a fake `env`; assert each captured statement includes `$BRAND`. (If mocking `cloudflare:workers` is not set up in `src/test/setup.ts`, add a minimal alias mock there.)
- [ ] **Step 6: Run** `pnpm --filter web test` and `pnpm exec oxlint` → PASS.
- [ ] **Step 7: Commit** `🔒 scope progress and speed queries to the brand`.

---

### Task 4: Scope logo queries; empty bank and optional git link

**Files:**
- Modify: `apps/web/src/lib/game-logos.server.ts`, `apps/web/src/lib/logo-metadata.server.ts`, the UI consumers of `Logo.gitLink` (find with `grep -rn "gitLink" apps/web/src packages/logos/src`), and `packages/logos/src/logos.ts` for the `Logo` type only (no logo data changes)
- Test: `apps/web/src/lib/game-logos.test.ts` (create)

**Interfaces:**
- Consumes: `prepareScoped` (Task 2), `brand.requiresGitLink` (Task 1).
- Produces: `Logo.gitLink` becomes `string | null` in the `Logo` interface (type-only change in `packages/logos/src/logos.ts`; no data change). `fetchCompleteLogoRows` only requires `git_link IS NOT NULL` when `brand.requiresGitLink`.

- [ ] **Step 1: Write failing tests** (`game-logos.test.ts`, mocking `prepareScoped` to capture SQL): for `tech`, the SELECT contains `git_link IS NOT NULL` and `brand = 'tech'`; for the `brand` entry (use an exported pure `buildCompleteLogosSql(requiresGitLink: boolean): string` to test without env), the SQL omits `git_link IS NOT NULL`.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement `buildCompleteLogosSql`** and convert `game-logos.server.ts` and `logo-metadata.server.ts` to `prepareScoped`: `listLogoMetadata` filters by brand; `upsertLogoMetadata` inserts `brand` and computes `day_order` as `COALESCE(MAX(day_order), 0) + 1` **over this brand's rows**, with `ON CONFLICT(brand, r2_key)`; `deleteLogoMetadata` and both `reorderLogoMetadata` UPDATEs filter by brand. Where the UI renders the git link (found by grep), render it only when `gitLink` is non-null.
- [ ] **Step 4: Empty bank safety.** Find every caller of `listGameLogos` / `fetchGameLogos` / `pickLogo` (`grep -rn "fetchGameLogos\|pickLogo\|listGameLogos" apps/web/src`) and make an empty bank render a simple "no logos yet" state instead of throwing (`pickLogo` currently takes `% bank.length`). Add a test: `pickLogo([], 0)` is not called by any path — assert the home route loader / hook handling returns an empty-state value for `[]` (write it at the lowest unit that owns the check, e.g. a `selectTodayLogo(bank, dayIndex): Logo | null` helper in `game-logic.ts` returning `null` for an empty bank).
- [ ] **Step 5: Run** `pnpm --filter web test` and `pnpm exec oxlint` → PASS.
- [ ] **Step 6: Commit** `🔒 scope logo queries to the brand and handle empty banks`.

---

### Task 5: Scope stats, mistakes and admin users

**Files:**
- Modify: `apps/web/src/lib/stats.server.ts`, `apps/web/src/lib/mistakes.server.ts`, `apps/web/src/lib/users.server.ts`
- Test: extend `apps/web/src/lib/brand-db.test.ts` (source-scan guard from Task 2 must now pass for all seven modules)

**Interfaces:** Consumes `prepareScoped` (Task 2). Public function signatures unchanged.

- [ ] **Step 1: Run the source-scan guard** → FAIL, naming the three files.
- [ ] **Step 2: Convert** `dailyFinishStats` and `topMistakesByLogo` queries to `prepareScoped` with `brand = $BRAND`. In `users.server.ts`, `listAdminUsers` keeps listing **all** users (accounts are shared) but its `progress` subquery filters `brand = $BRAND` (games played / last played are for this brand); the `session` subquery and the `user` count are unscoped; `getAdminUserCounts`' anonymous count filters `brand = $BRAND`. The source-scan allowlist covers the `user`/`session`-only parts.
- [ ] **Step 3: Run** `pnpm --filter web test` and `pnpm exec oxlint` → PASS (guard green).
- [ ] **Step 4: Commit** `🔒 scope stats, mistakes and admin users to the brand`.

---

### Task 6: Brand-driven names, metadata and emails

**Files:**
- Modify: `apps/web/src/routes/__root.tsx` (SITE_URL, theme-color), `apps/web/messages/en.json` and callers, `apps/web/src/emails/reset-password.tsx`, `apps/web/src/lib/auth.server.ts` (email subject/from name/text), the share-text component (`RevealPanel.tsx`; its test asserts "I found today's tech logo!\nSlogodle #5 2/3"), legal routes `cgu.tsx`, `confidentialite.tsx`, `mentions-legales.tsx`
- Test: `RevealPanel.test.tsx` (extend), `reset-password` email render test (create if absent)

**Interfaces:** Consumes `brand` (Task 1): `brand.name`, `brand.origin`, `brand.themeColor`, `brand.shareNoun`.

- [ ] **Step 1: Inventory:** `grep -rniE "slogodle|tech\.slogodle|tech logo" apps/web/src apps/web/messages apps/web/public --include='*.ts' --include='*.tsx' --include='*.json' --include='*.html'` and list every hit as "brand-driven" or "leave" (localStorage keys like `slogodle_speed_seen_v1` stay as they are, per spec).
- [ ] **Step 2: Write failing tests:** with the default (tech) brand the share text is unchanged — `I found today's tech logo!\nSlogodle #5 2/3\n\n🟥🟩\n\n${origin}`; with a mocked `brand` of `shareNoun: "brand"` and `name: "X"` it reads `I found today's brand logo!\nX #5 2/3 …`; the reset email's subject/html contain `brand.name`.
- [ ] **Step 3: Run** → FAIL.
- [ ] **Step 4: Replace each "brand-driven" hit** with `brand.*` (for paraglide messages, pass the name as a message parameter or compute titles in code; keep `en.json` the only locale). `SITE_URL` becomes `brand.origin`; OG/email image URLs derive from it.
- [ ] **Step 5: Run** `pnpm --filter web test` and `pnpm exec oxlint` → PASS; `VARIANT=brand pnpm --filter web build` succeeds.
- [ ] **Step 6: Commit** `🎨 drive names, metadata and emails from the brand config`.

---

### Task 7: Shared login across subdomains

**Files:**
- Modify: `apps/web/src/lib/auth.server.ts`
- Test: `apps/web/src/lib/auth-config.test.ts` (create; extract a pure `buildAuthOptionsFragment(brandOrigins: string[], isDev: boolean)` returning `{ trustedOrigins, advanced }` so it is testable)

**Interfaces:** Consumes `BRANDS` (Task 1). Produces `buildAuthOptionsFragment(origins: string[], isDev: boolean): { trustedOrigins: string[]; advanced?: { crossSubDomainCookies: { enabled: true; domain: ".slogodle.com" } } }`.

- [ ] **Step 1: Write failing tests:** production → `trustedOrigins` equals every `BRANDS[*].origin` and `advanced.crossSubDomainCookies.domain === ".slogodle.com"`; dev (`isDev` true) → no `advanced` (cookie must stay host-only on localhost), `trustedOrigins` still includes the brand origins.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** the helper and spread it into the `betterAuth({...})` options in `getAuth()`. Keep `baseURL: env.BETTER_AUTH_URL` (each deployment sets its own).
- [ ] **Step 4: Run** `pnpm --filter web test` → PASS.
- [ ] **Step 5: Commit** `🔐 share the login cookie across brand subdomains`.

---

### Task 8: Wrangler environments, scripts, CI, docs

**Files:**
- Modify: `apps/web/wrangler.jsonc`, `apps/web/package.json`, `.github/workflows/ci.yml`, `README.md`, `docs/superpowers/specs/2026-11-19-multi-brand-design.md` (correct "Google" to "GitHub" — the app's OAuth provider is GitHub, see `auth.server.ts`)

**Interfaces:** none consumed in code.

- [ ] **Step 1: `wrangler.jsonc`:** the top-level config stays the `tech` deployment unchanged. Add `env.brand` with: `name` (placeholder `brand-slogodle`), `routes` for `brand.slogodle.com`, `vars` (`ADMIN_EMAIL`), the **same** `d1_databases` entry, and its own `r2_buckets` (`LOGO_BUCKET` → new bucket `brand-logos`, plus the videos binding only if the code still requires it — check `grep -rn slogodle_videos_tmp apps/web/src`). Wrangler does not inherit `d1_databases`/`r2_buckets`/`vars` into environments, so redeclare them.
- [ ] **Step 2: `package.json` scripts:** `dev:brand` (`VARIANT=brand CLOUDFLARE_ENV=brand vite dev`), `build:brand` (`VARIANT=brand CLOUDFLARE_ENV=brand vite build`), `deploy:brand` (`pnpm build:brand && wrangler deploy --env brand`); the existing `dev`/`build`/`deploy` stay the tech variant (explicit `VARIANT=tech`).
- [ ] **Step 3: CI:** add a step after Test that builds both variants (`pnpm --filter web build` and `pnpm --filter web build:brand`).
- [ ] **Step 4: Verify:** `pnpm --filter web build && pnpm --filter web build:brand` both succeed; `grep` the two `dist` outputs: tech's contains `tech.slogodle.com`, brand's contains `brand.slogodle.com`. Boot `pnpm --filter web dev:brand` and confirm the home page responds and shows the brand placeholder name.
- [ ] **Step 5: README:** a short "Variants" section — `VARIANT`, scripts, and the **manual steps** to ship a brand: create the R2 bucket (`wrangler r2 bucket create brand-logos`); `wrangler secret put` per env (`BETTER_AUTH_SECRET` same value as tech, `BETTER_AUTH_URL` = the brand origin, `GITHUB_CLIENT_ID/SECRET` from a **separate GitHub OAuth App per brand** because a GitHub OAuth App allows one callback URL, `RESEND_API_KEY`, `EMAIL_FROM`); run `wrangler d1 migrations apply slogodle --remote` then deploy immediately.
- [ ] **Step 6: Commit** `🚀 add brand wrangler environment, scripts and CI build`.

---

### Task 9: End-to-end verification

- [ ] **Step 1:** `pnpm test`, `pnpm exec oxlint`, `pnpm --filter web build`, `pnpm --filter web build:brand` all green.
- [ ] **Step 2:** On a **scratch local D1** (`wrangler d1 migrations apply slogodle --local`), run both variants' dev servers; play a day on `tech` and on `brand`, confirm each only shows its own progress and speed ladder, an account created on one signs in on the other (host-only cookie in dev means sign in separately — the shared cookie is verified post-deploy), and `brand` with an empty bucket shows the empty state, not an error.
- [ ] **Step 3:** Report results to the owner. Production rollout order (owner-run): apply migration `0009` to remote D1 → set brand secrets / create bucket / register GitHub OAuth app → deploy tech → deploy brand.

## Follow-ups (not in this plan)

- The `slogodle-new-brand` skill and optional logos-package helper (spec "Follow-up todos").
- Real name, colors, logo set and website-link field for the second brand.
