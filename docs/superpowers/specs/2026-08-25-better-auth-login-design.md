# Auth login page (Better Auth + D1)

Status: approved, pre-implementation
Date: 2026-08-25

## Context

`/admin` (logo metadata management) currently has no real access control — it's
gated only by `import.meta.env.DEV`, so `beforeLoad` throws `notFound()` in any
production build. There are no user accounts anywhere in the app today.

Goal: real auth for the single admin user, protecting `/admin` in production.
No public/player accounts. Confirmed with the project owner:

- Auth library: Better Auth.
- Storage: Cloudflare D1 (the existing `DB` binding, already used for
  `logo_metadata`).
- Sign-in methods: email + password, and GitHub OAuth.
- Scope of this change: build the login page and its backend, **and** swap
  `/admin`'s `DEV`-only gate for a real session check. Not in scope: logout
  UI elsewhere, password reset/email verification flows, a registration UI
  (the admin account is created directly, out of band).

## Decisions made during brainstorming

1. **D1 adapter:** `kysely-d1` (the community Kysely dialect Better Auth's own
   docs point to for D1) is unmaintained. Use Drizzle instead —
   `@better-auth/drizzle-adapter` + `drizzle-orm/d1` — which is the actively
   maintained, officially documented path for Better Auth on D1.
2. **Migration tooling:** `drizzle-kit` is used once, offline, to generate the
   correct auth schema SQL (via Better Auth's own CLI generating a Drizzle
   schema, then `drizzle-kit generate` turning it into SQL). The output is
   copied into this project's existing plain-`.sql` migration convention
   (`migrations/000N_*.sql`, applied via `wrangler d1 migrations apply`) rather
   than adopting drizzle-kit as an ongoing migration runner — there is
   already one migration system in this repo and it stays the only one.
3. **Runtime binding access:** follows the existing codebase convention
   (`logo-metadata.server.ts`, `r2-logos.server.ts`) of importing `env` from
   `cloudflare:workers` and reading bindings/secrets lazily inside a function
   body, never at module top-level — `env` only resolves inside an active
   request.
4. **Auth mount point:** `/api/auth/*`, handled with a short-circuit in
   `src/server.ts`'s `fetch`, the same pattern already used there for
   `/api/logos/:key` — not a TanStack Start file-based API route, since this
   version of `@tanstack/react-start` (1.168.x) has no server-route
   convention in its public API (checked: no `createServerFileRoute`/
   `ServerRoute` export anywhere in the installed package).

## Architecture

### Dependencies

Add to `apps/web/package.json`:

- `better-auth` (runtime)
- `@better-auth/drizzle-adapter` (runtime)
- `drizzle-orm` (runtime — used both for the live adapter and, transiently,
  for schema generation)
- `drizzle-kit` (devDependency — one-time schema generation only)

### D1 schema

New migration `migrations/0003_create_auth_tables.sql`, containing Better
Auth's four core tables: `user`, `session`, `account`, `verification`. The
exact column set is generated, not hand-written:

1. `npx @better-auth/cli generate` against a throwaway Drizzle config
   (`emailAndPassword` + `socialProviders.github` enabled, matching the real
   config's feature set so the generated columns match) to produce a Drizzle
   `schema.ts`.
2. `npx drizzle-kit generate` on that schema to produce the actual SQL.
3. Copy that SQL, as-is, into `migrations/0003_create_auth_tables.sql`.

### `src/lib/auth.server.ts` (new)

```ts
import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";

let instance: ReturnType<typeof betterAuth> | undefined;

export function getAuth() {
  if (!instance) {
    instance = betterAuth({
      database: drizzleAdapter(drizzle(env.DB), { provider: "sqlite" }),
      emailAndPassword: { enabled: true },
      socialProviders: {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        },
      },
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.BETTER_AUTH_URL,
    });
  }
  return instance;
}
```

Lazy singleton, matching decision #3 — first call happens inside a request
(either from `server.ts`'s auth route or a server function), never at import
time.

### `src/lib/auth-client.ts` (new)

Browser-side client:

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({ baseURL: "/api/auth" });
```

Used by the login page for `authClient.signIn.email(...)` and
`authClient.signIn.social({ provider: "github" })`, and by `/admin`'s
client-side session check if needed (see below).

### `src/server.ts`

Add a short-circuit before the existing paraglide/TanStack fallthrough,
mirroring the `/api/logos/:key` pattern already there:

```ts
if (url.pathname.startsWith("/api/auth/")) {
  return getAuth().handler(request);
}
```

### `/admin` protection

Better Auth's default `emailAndPassword`/`socialProviders.github` config lets
*anyone* create an account (via the sign-up endpoint or GitHub OAuth) — being
authenticated is not the same as being the admin. Since this app has exactly
one admin and no role system, authorization is a single email allowlist
check: a new `ADMIN_EMAIL` env var, compared against the session's user
email.

`beforeLoad` currently:

```ts
beforeLoad: () => {
  if (!import.meta.env.DEV) {
    throw notFound();
  }
},
```

Replaced with a real check via a new server function (`src/lib/session.ts`,
`fetchIsAdmin`) that does both the session lookup and the email comparison
server-side — the admin email never ships to the client bundle or over the
wire:

```ts
beforeLoad: async () => {
  const isAdmin = await fetchIsAdmin();
  if (!isAdmin) {
    throw redirect({ to: "/login" });
  }
},
```

`fetchIsAdmin` reads the incoming request's headers via `getRequestHeaders()`
(from `@tanstack/react-start/server`), passes them to
`getAuth().api.getSession({ headers })`, and returns
`session?.user.email === env.ADMIN_EMAIL`.

The `DEV`-only gate is removed entirely — access control is now the real
check in both dev and production.

The first (and only) account is created by the project owner directly against
the sign-up endpoint (`POST /api/auth/sign-up/email`, a plain fetch/curl call
— no UI is built for this, matching the "no registration UI" scope decision)
using their own email, which they also set as `ADMIN_EMAIL`. Anyone else who
signs up (email/password or GitHub) gets a real session but `fetchIsAdmin`
stays `false` for them, so `/admin` stays closed.

### `/login` route (new)

`src/routes/login.tsx` + `login.module.css`, styled consistently with the
existing card look (`shared.module.css`'s `.card`, `admin.module.css`'s
input/button classes — no new visual language introduced):

- Email + password fields, a submit button calling
  `authClient.signIn.email({ email, password })`.
- A "Sign in with GitHub" button calling
  `authClient.signIn.social({ provider: "github", callbackURL: "/admin" })`.
- On successful email/password sign-in, navigate to `/admin`.
- Inline error display on failure (matching the existing
  `r2Error`/`metadataError` pattern in `admin.tsx` — plain text, no toast
  system exists in this app).
- Copy goes through Paraglide, following the existing `m.xxx()` convention
  (new keys added to `messages/en.json`, e.g. `login_title`,
  `login_email_label`, `login_password_label`, `login_submit`,
  `login_github`, `login_error`).

### Env vars

Added to `.env.example`, following the existing block style:

```
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
ADMIN_EMAIL=
```

GitHub OAuth App callback URL: `{BETTER_AUTH_URL}/api/auth/callback/github`
— `http://localhost:5173/api/auth/callback/github` for local dev (port per
`vite dev`'s actual output), production URL once known.

## File-by-file change list

- `package.json` — add `better-auth`, `@better-auth/drizzle-adapter`,
  `drizzle-orm`, `drizzle-kit` (dev).
- `migrations/0003_create_auth_tables.sql` — new, generated (see above).
- `src/lib/auth.server.ts` — new: `getAuth()`.
- `src/lib/auth-client.ts` — new: browser `authClient`.
- `src/lib/session.ts` — new: `fetchIsAdmin` server function.
- `src/server.ts` — add `/api/auth/*` short-circuit.
- `src/routes/login.tsx`, `login.module.css` — new.
- `src/routes/admin.tsx` — replace `DEV`-only `beforeLoad` with session
  check + redirect.
- `messages/en.json` — add login page copy keys.
- `.env.example` — add the four new vars.

No changes to: `src/routes/index.tsx`, any game-logic files, `packages/logos`,
R2/logo-metadata code paths.

## Explicitly out of scope (follow-ups, not this change)

- Logout button/UI (session cookie can be cleared manually via Better Auth's
  `/api/auth/sign-out` endpoint in the meantime).
- Password reset / email verification flows.
- A registration UI — the admin account is created via one manual call to
  the sign-up endpoint (see "`/admin` protection" above), not a UI.
- Provisioning the GitHub OAuth App itself (project owner's action, per
  earlier discussion) and setting the real secret values in `.env`/
  `wrangler secret put` for production.

## Testing

User tests manually (per standing project preference — no automated
verification commands run as part of this change). Manual checks to hand
back:

- `/login` renders with both sign-in methods visible.
- Email/password sign-in with a valid admin account creates a session and
  lands on `/admin`.
- Wrong password shows an inline error, no session created.
- "Sign in with GitHub" redirects to GitHub's OAuth consent screen (once
  `GITHUB_CLIENT_ID`/`SECRET` are set) and returns to `/admin` on success.
- Visiting `/admin` while logged out redirects to `/login`, in both `pnpm
  dev` and a production build (`vite build && wrangler deploy` or local
  preview) — the previous `DEV`-only behavior must not silently persist.
