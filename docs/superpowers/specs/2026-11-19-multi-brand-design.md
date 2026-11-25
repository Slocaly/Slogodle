# Multi-brand Slogodle — design

## Intent

Slogodle is a daily logo-guessing game (classic mode + speed mode) whose logo set is
tech/open-source logos. We want a second app with the **same game and game modes**
but a **different logo library** (general brands: Netflix, Twitter, …), and the
ability to add a third, fourth… later. The apps must **not** be duplicated
codebases: one repo, one `apps/web`, one set of game code, selected per deployment
by configuration.

- `tech.slogodle.com` — existing app (brand `tech`)
- `brand.slogodle.com` — new app (brand `brand`; the final id/name is a placeholder)

## Goals

- One codebase, N deployments. A deployment's identity is set by an env variable
  (`VARIANT=tech|brand|…`, read at **build time**).
- A **brand config** object (one per brand) is the only place that knows about
  brand differences: display name, domain, colors/theme tokens, copy/metadata,
  R2 bucket, which logo-metadata fields are shown. Game code reads the active
  config and never branches on a brand name.
- Adding a brand = a config entry + a Wrangler environment + an R2 bucket + a
  deploy. No game-code changes.
- **One account across all brands, progress separate per brand.**
- Existing `tech` production data keeps working untouched.

## Non-goals

- Videos: `apps/video` and the Buffer publishing flow (skill
  `slogodle-publish-videos`) stay **tech-only**. Do not make them brand-aware.
- Admin page across brands: the admin UI shows **one brand only** (the current
  deployment's brand). Cross-brand admin may come later; don't build it, but
  don't make it hard.
- No per-brand game rules or per-brand game modes. Same game everywhere.
- `apps/landing` is **completely out of scope** (owner decision): do not touch
  it, do not make it brand-aware.

## Anti-goals

- A fork/copy of `apps/web` per brand.
- `if (brand === "tech")` checks scattered in components/queries.
- Any game query that can return another brand's rows (leaked scores/progress).
- Breaking or losing existing tech users, sessions, progress or logos.

## Decisions (made with the owner)

1. **Brand selection**: an env variable chooses a brand config at deploy time
   (one deployment per brand). The env variable approach and the config-object
   approach were proposed and agreed.
2. **Data: one shared D1 database with a `brand` column** on the game tables
   only: `progress`, `speed_run`, `logo_metadata`. Auth tables (`user`,
   `session`, `account`, `verification`) are unchanged and shared. Separate
   databases per brand were rejected because shared accounts need the existing
   foreign keys (`progress.user_id → user.id ON DELETE CASCADE`) and joins
   (`speed_run LEFT JOIN user`, the admin users query).
3. **Logos: one R2 bucket per brand**, bound per deployment via Wrangler
   environment. Each brand has its own logo metadata rows and daily order.
4. **Accounts: shared across brands**, via a login cookie scoped to
   `.slogodle.com` (better-auth cross-subdomain cookies) with the **same
   `BETTER_AUTH_SECRET`** and same auth database on all deployments. Users sign
   in once and are signed in on every brand subdomain.
5. **Admin**: scoped to the current brand only for now.
6. **Videos**: tech-only (see non-goals).

## Data design

- Migration adds `brand TEXT NOT NULL DEFAULT 'tech'` to `progress`,
  `speed_run`, `logo_metadata`; backfills existing rows to `'tech'`. (D1/SQLite
  can't alter constraints in place — rebuilding tables where needed to change
  unique indexes is expected.)
- Unique indexes gain `brand`: e.g. `progress (user_id, day_index)` →
  `(user_id, brand, day_index)`, same for `speed_run` (including `is_replay`),
  and `logo_metadata.r2_key` / `day_order` uniqueness becomes per brand.
  `day_index` is a per-brand notion (each brand has its own daily sequence).
- **One helper** injects the brand filter/value into every game query
  (reads and writes). Query modules (`progress.server.ts`, `speed.server.ts`,
  `stats.server.ts`, `mistakes.server.ts`, `game-logos.server.ts`,
  `logo-metadata.server.ts`, `users.server.ts`) go through it. Goal: it should
  be hard to write a game query that forgets the brand.
- Anonymous progress (`anon_id`) is also per brand.
- `users.server.ts` (admin list) keeps showing all users (accounts are shared)
  but its game-activity columns (games played, last seen) are for the current
  brand only.

## Brand config

- Lives in a typed module (e.g. `apps/web/src/brands/…`), one entry per brand;
  the active brand is resolved once at build time from the `VARIANT` env variable
  and fails loudly on an unknown/missing value.
- Covers at least: id, display name, public URL/origin, theme tokens (colors),
  logo wordmark/favicon/OG assets, page title/meta, share-text wording
  (today: "I found today's tech logo!"), email branding
  (`emails/reset-password.tsx`), and R2 bucket reference.
- Tech-specific wording inside i18n messages (`apps/web/messages`) and legal
  pages (`cgu`, `confidentialite`, `mentions-legales`) must come from the config
  or neutral wording where it names the product/domain.
- localStorage keys that embed "slogodle" (e.g. `slogodle_speed_seen_v1`) are
  per-origin already (different subdomains) — leave as is unless a collision is
  found.

## Logo metadata shape

Logo fields today are tech-flavoured (`industry`, `founded`, `description`,
`fun_fact`, `git_link` = "link to the project's GitHub repository"). For
general brands `git_link` likely has no meaning. The brand config declares
which hint/reveal fields apply; the builder should keep the `Logo` type
working for both and not require GitHub links for brands that don't have them.
(See open points.)

## Deployment

- `wrangler.jsonc` gains an environment per brand: its own Worker name, route
  (`tech.slogodle.com`, `brand.slogodle.com`), R2 `LOGO_BUCKET` bucket, and the
  `VARIANT` value used for that brand's build. They all bind the **same** D1 database (`DB`) and the same auth secret.
- Auth config (`auth.server.ts`): cross-subdomain cookie on `.slogodle.com`,
  `trustedOrigins` containing every brand origin, OAuth (GitHub) callback URLs
  (one GitHub OAuth App per brand, since an App allows a single callback URL).
- Local dev: `pnpm run dev` must still work for the default brand, with an easy
  way to run another brand locally (e.g. `VARIANT=brand pnpm run dev`).
- Migrations remain one folder, applied once to the shared D1.

## Constraints

- Existing stack: TanStack Start on Cloudflare Workers, D1, R2, better-auth,
  paraglide (inlang), turbo + pnpm monorepo, oxlint/oxfmt.
- Production `tech` data and URL must keep working through the migration.
- Existing tests (`pnpm test`) keep passing; new tests cover the brand helper
  (a query for brand A never returns brand B rows) and the config resolver.

## Left to the builder

- Exact table-rebuild SQL for the migration; file layout of the brand config; how the brand helper is
  shaped (wrapper, query-builder fn, …).
- How the R2 logo-upload/admin flow picks the bucket for the current brand.

## Builder-check resolutions (calls made by the designer — flagged for the owner to check)

- **Logo pipeline (owner decided):** the new brand's bucket starts empty. The
  owner will create a separate logos package for it later, uploadable like the
  current one. Until then, the web admin upload flow (pointed at the current
  brand's bucket) is enough. `packages/logos`,
  `apps/video` and the add-logo tooling stay tech-only (`apps/landing` is out of scope); no seed
  or import step.
- **Brand resolution (owner decided):** build-time env variable `VARIANT`. Each
  brand therefore has its own build (own `dist`) and its own deploy; CI builds
  and deploys each variant separately.
- **Migration safety:** the migration must be backward-compatible for one deploy
  (new `brand` columns default to `'tech'`, so the old code keeps working until
  the new code ships). Test against a copy/`backup.sql`; no staging DB assumed.
- **Per-deployment auth URL:** each deployment uses its own `BETTER_AUTH_URL`
  (its own origin) and its own GitHub OAuth App (with that origin's callback URL) is used. Email sender
  stays shared; only the email template branding is per brand.
- **`git_link` (owner: new brand will use a main/website link instead, to be
  confirmed later):** stays an optional field, no rename, no data migration.
  Brands that don't use it hide it via config; a website link can be added when
  decided.
- **Daily sequence (owner confirmed: later than tech):** each brand has its own start date in its config; `day_index`
  counts from it.
- **Admin:** the same `ADMIN_EMAIL` applies to every brand.
- **i18n:** the same locales for every brand; brand copy is translated as content
  work after the mechanism ships.

## Production facts (owner confirmed)

- Production tech app is already at `tech.slogodle.com`; `slogodle.com` is a
  separate landing page (`apps/landing`). The login cookie is therefore scoped
  to `.slogodle.com`.
- A one-time forced re-login for existing signed-in users is acceptable.
- Anonymous users' streaks live in localStorage (per origin); `tech.slogodle.com`
  keeps its origin, so they are unaffected. A new brand subdomain starts with its
  own empty local data. The re-login happens only once; later brand subdomains
  share the `.slogodle.com` cookie.

## Follow-up todos (after the mechanism ships)

- [ ] **Create a skill, e.g. `slogodle-new-brand`, that makes adding a brand easy.**
  It should walk through and automate every step of "Adding a brand":
  - add the brand entry to the typed brand config (name, domain, colors,
    copy, share text, email branding, daily-sequence start date, which logo
    fields apply, R2 bucket name);
  - add the Wrangler environment (Worker name, route `<brand>.slogodle.com`,
    `LOGO_BUCKET` bucket, `VARIANT` value for the build);
  - create the R2 bucket;
  - register the new origin in better-auth `trustedOrigins` and a GitHub OAuth App
    for it (callback URL) (manual step: tell the user exactly what to add);
  - add the build/deploy entry for CI;
  - run a checklist: `VARIANT=<brand> pnpm run dev` boots, build passes, brand
    isolation tests pass.
  Use the skill-creator skill to write and test it. Model it on the existing
  `slogodle-publish-videos` skill for tone and structure.
- [ ] Optionally a companion skill/script for the new brand's logos package
  (the owner will create the first one by hand).

## Open points (to settle before/during planning)

- Name, domain id, colors and logo set for the new brand (the content, not the
  mechanism) — can be filled in after the mechanism ships.
- Whether `git_link` is replaced by a generic "website" link for brands.
