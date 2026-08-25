# Better Auth login page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Real auth for the single admin user — a `/login` page (email+password and GitHub OAuth via Better Auth), backed by Cloudflare D1, protecting `/admin` in place of its current `DEV`-only gate.

**Architecture:** Better Auth mounted at `/api/auth/*` inside the existing Worker `fetch` handler (`src/server.ts`), storing its `user`/`session`/`account`/`verification` tables in the existing D1 binding via `@better-auth/drizzle-adapter` + `drizzle-orm/d1`. `/admin`'s `beforeLoad` calls a server function that checks for a session *and* that the session's email matches a single-admin allowlist (`ADMIN_EMAIL`), redirecting to `/login` otherwise.

**Tech Stack:** Better Auth, `@better-auth/drizzle-adapter`, `drizzle-orm` (D1 dialect), TanStack Start server functions, Paraglide i18n.

**Spec:** `docs/superpowers/specs/2026-08-25-better-auth-login-design.md`

## Global Constraints

- D1 adapter is Drizzle (`@better-auth/drizzle-adapter` + `drizzle-orm/d1`) only. `kysely-d1` is unmaintained — do not use it, do not add it as a dependency.
- Read Cloudflare bindings/secrets (`env` from `cloudflare:workers`) lazily inside function bodies only, never at module top-level — this is the existing convention in `logo-metadata.server.ts` and `r2-logos.server.ts`, and `env` only resolves inside an active request.
- Migrations stay plain `.sql` files under `apps/web/migrations/`, applied via `wrangler d1 migrations apply` — this plan does not adopt `drizzle-kit` as an ongoing migration runner, only as a one-time schema-generation tool (already run; its output is baked into Task 1).
- `apps/web/wrangler.jsonc` marks the D1 binding `remote: true` — every `wrangler d1` command, including `migrations apply`, touches the real production database, not a local simulator. Never run `wrangler d1 migrations apply` as part of implementing a task. It is called out explicitly as a manual, user-run step.
- This app has no test framework and none is introduced here. Each task ends with a manual verification checklist for the project owner to run, instead of automated tests — do not run `pnpm build`/`tsc`/`pnpm dev` yourself to "verify" a task; describe the check.
- Never `git add` / `git commit` — the project owner commits everything themselves.
- UI copy goes through Paraglide (`m.xxx()`, keys added to `apps/web/messages/en.json`), matching every existing route.
- New page styling follows `admin.module.css`'s existing input/button idiom (`.r2Input`, `.r2SaveBtn`, `.topBar`/`.backLink`), not `shared.module.css`'s game-specific `.card` (that one is coupled to the physics-pile background's pointer-events layering and doesn't fit a plain page).

---

### Task 1: D1 schema for Better Auth

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/migrations/0003_create_auth_tables.sql`

**Interfaces:**
- Produces: D1 tables `user`, `session`, `account`, `verification`, matching Better Auth's default core schema. Task 2's `auth.server.ts` requires these to exist (once the migration is applied) for any auth call to succeed.

- [ ] **Step 1: Add dependencies**

Add to `apps/web/package.json`, in `dependencies`:

```json
"@better-auth/drizzle-adapter": "^1.7.1",
"better-auth": "^1.7.1",
"drizzle-orm": "^0.45.2",
```

And in `devDependencies`:

```json
"drizzle-kit": "^0.31.10",
```

Run `pnpm install` from the repo root.

- [ ] **Step 2: Write the migration file**

Create `apps/web/migrations/0003_create_auth_tables.sql` with exactly this content. (Provenance, for context — not something to redo: this is Better Auth's default schema for `emailAndPassword` + a `github` social provider, generated via `npx @better-auth/cli generate` against a throwaway Drizzle config and turned into SQL via `npx drizzle-kit generate`, then adapted to this project's unquoted-identifier migration style — verified by actually running both tools rather than hand-transcribed, since the community's D1 Kysely adapter is known to have drifted from Better Auth's docs before.)

```sql
-- Migration number: 0003 	 2026-08-25T00:00:00.000Z

CREATE TABLE user (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  email_verified INTEGER DEFAULT false NOT NULL,
  image TEXT,
  created_at INTEGER DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  updated_at INTEGER DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
CREATE UNIQUE INDEX user_email_unique ON user (email);

CREATE TABLE session (
  id TEXT PRIMARY KEY NOT NULL,
  expires_at INTEGER NOT NULL,
  token TEXT NOT NULL,
  created_at INTEGER DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  updated_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX session_token_unique ON session (token);
CREATE INDEX session_userId_idx ON session (user_id);

CREATE TABLE account (
  id TEXT PRIMARY KEY NOT NULL,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at INTEGER,
  refresh_token_expires_at INTEGER,
  scope TEXT,
  password TEXT,
  created_at INTEGER DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
CREATE INDEX account_userId_idx ON account (user_id);

CREATE TABLE verification (
  id TEXT PRIMARY KEY NOT NULL,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  updated_at INTEGER DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
CREATE INDEX verification_identifier_idx ON verification (identifier);
```

- [ ] **Step 3: Hand off the manual, real-database step**

This migration is not applied as part of this task. Tell the project owner:

> Run this yourself when ready (it touches the real production D1 database):
> ```bash
> cd apps/web && pnpm exec wrangler d1 migrations apply slogodle --remote
> ```
> Confirm it worked with:
> ```bash
> pnpm exec wrangler d1 execute slogodle --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
> ```
> Expected: `user`, `session`, `account`, `verification` alongside the existing `logo_metadata`.

Task 2's manual verification depends on this having been run.

---

### Task 2: Better Auth backend, mounted at `/api/auth/*`

**Files:**
- Create: `apps/web/src/lib/auth.server.ts`
- Modify: `apps/web/src/server.ts`
- Modify: `apps/web/.env.example`

**Interfaces:**
- Consumes: D1 tables from Task 1.
- Produces: `getAuth()` from `src/lib/auth.server.ts` — `() => ReturnType<typeof betterAuth>`, a lazily-constructed singleton. Task 4's `session.ts` calls `getAuth().api.getSession(...)`.
- Produces: `/api/auth/*` live on the Worker (sign-up, sign-in, OAuth callback, session, sign-out — Better Auth's full default route set).

- [ ] **Step 1: Write `src/lib/auth.server.ts`**

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

The `if (!instance)` check inside the function body (never at module scope) is what makes this safe under `cloudflare:workers`' `env` — see Global Constraints.

- [ ] **Step 2: Mount it in `src/server.ts`**

Current file:

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
    return paraglideMiddleware(request, () => handler.fetch(request))
  },
}
```

Change the last block to add an `/api/auth/*` short-circuit, mirroring the existing `/api/logos/:key` one, and add the import:

```ts
import handler from '@tanstack/react-start/server-entry'
import { env } from 'cloudflare:workers'
import { paraglideMiddleware } from './paraglide/server.js'
import { getAuth } from './lib/auth.server'

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
    if (url.pathname.startsWith('/api/auth/')) {
      return getAuth().handler(request)
    }
    return paraglideMiddleware(request, () => handler.fetch(request))
  },
}
```

- [ ] **Step 3: Add env vars to `.env.example`**

Append to `apps/web/.env.example`:

```
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

- [ ] **Step 4: Manual verification (hand to the project owner)**

Prerequisite: Task 1's migration has been applied to the real D1 database.

> In your local `.env`, set:
> - `BETTER_AUTH_SECRET` to a random string (e.g. `openssl rand -base64 32`)
> - `BETTER_AUTH_URL` to `http://localhost:5173` (confirm the actual port from `pnpm dev`'s output)
> - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` can stay blank for now — GitHub sign-in just won't work until Task 3 and a registered OAuth App exist
>
> Run `pnpm dev`, then in another terminal:
> ```bash
> curl -i -X POST http://localhost:5173/api/auth/sign-up/email \
>   -H "Content-Type: application/json" \
>   -d '{"email":"you@example.com","password":"a-real-password","name":"You"}'
> ```
> Expected: `200`, a `set-cookie` header, and a JSON body with your new user. This also *is* the one-off "create the admin account" step from the spec — use your real email, since Task 4 will only let that exact email into `/admin`.
>
> If it instead fails with a D1 "no such table: user" error, Task 1's migration hasn't been applied yet.

---

### Task 3: `/login` page

**Files:**
- Create: `apps/web/src/lib/auth-client.ts`
- Create: `apps/web/src/routes/login.tsx`
- Create: `apps/web/src/routes/login.module.css`
- Modify: `apps/web/messages/en.json`

**Interfaces:**
- Consumes: `getAuth()`'s routes from Task 2 (via HTTP, not a direct import).
- Produces: `authClient` from `src/lib/auth-client.ts`, reusable by any future page that needs client-side auth (e.g. a future logout button).

- [ ] **Step 1: Write `src/lib/auth-client.ts`**

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({ baseURL: "/api/auth" });
```

- [ ] **Step 2: Add message keys to `apps/web/messages/en.json`**

Add these keys (anywhere in the object, e.g. just before `"skip_to_content"`):

```json
"login_title": "Admin sign in",
"login_email_label": "Email",
"login_password_label": "Password",
"login_submit": "Sign in",
"login_submitting": "Signing in…",
"login_or": "or",
"login_github": "Sign in with GitHub",
"login_error": "Sign in failed: {error}",
"login_back_to_game": "Back to game",
```

- [ ] **Step 3: Write `src/routes/login.module.css`**

```css
.page {
  min-height: 100vh;
  padding: 32px;
  color: var(--text);
  font-family: "Fredoka", sans-serif;
  display: flex;
  flex-direction: column;
}

.topBar {
  margin-bottom: 24px;
}

.backLink {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
}

.backLink:hover {
  color: var(--accent-pink);
}

.card {
  width: 100%;
  max-width: 360px;
  margin: 48px auto 0;
  background: var(--card-bg);
  border-radius: 24px;
  padding: 32px;
  box-shadow:
    inset 0 1px 0 var(--card-highlight),
    0 24px 48px -16px var(--shadow-color),
    0 10px 24px -12px var(--shadow-color);
}

.title {
  margin: 0 0 24px;
  font-size: 22px;
  font-weight: 700;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
}

.input {
  font: inherit;
  font-size: 14px;
  color: var(--text);
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
}

.submitBtn {
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  background: var(--accent-yellow);
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
  margin-top: 4px;
}

.submitBtn:disabled {
  opacity: 0.6;
  cursor: default;
}

.error {
  color: var(--accent-pink);
  font-size: 12px;
  margin: 0;
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
  font-size: 12px;
  color: var(--muted);
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border);
}

.githubBtn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
}

.githubBtn:hover {
  border-color: var(--accent-pink);
}

.githubIcon {
  width: 16px;
  height: 16px;
}
```

- [ ] **Step 4: Write `src/routes/login.tsx`**

```tsx
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { m } from "../paraglide/messages.js";
import { authClient } from "../lib/auth-client";
import { GithubIcon } from "../components/icons/GithubIcon";
import styles from "./login.module.css";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message ?? "Sign in failed");
      return;
    }
    navigate({ to: "/admin" });
  };

  const handleGithub = () => {
    authClient.signIn.social({ provider: "github", callbackURL: "/admin" });
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink}>
          ← {m.login_back_to_game()}
        </Link>
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>{m.login_title()}</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>{m.login_email_label()}</span>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{m.login_password_label()}</span>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? m.login_submitting() : m.login_submit()}
          </button>
          {error && <p className={styles.error}>{m.login_error({ error })}</p>}
        </form>

        <div className={styles.divider}>{m.login_or()}</div>

        <button type="button" className={styles.githubBtn} onClick={handleGithub}>
          <GithubIcon className={styles.githubIcon} />
          {m.login_github()}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Manual verification (hand to the project owner)**

> With `pnpm dev` running and Task 2's admin account created:
> - Visit `/login`. Both the form and the GitHub button should render.
> - Submit the wrong password → an inline error appears, no navigation.
> - Submit the correct email/password from Task 2 → you land on `/admin` (it still renders unconditionally in dev at this point — Task 4 wires up the actual protection).
> - The GitHub button redirects to GitHub's OAuth consent screen only once `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` are set — until then it's expected to fail; that's fine to defer.

---

### Task 4: Protect `/admin` with a real session + admin-email check

**Files:**
- Create: `apps/web/src/lib/session.ts`
- Modify: `apps/web/src/routes/admin.tsx`
- Modify: `apps/web/.env.example`

**Interfaces:**
- Consumes: `getAuth()` from Task 2.
- Produces: `fetchIsAdmin` from `src/lib/session.ts` — a `createServerFn` returning `Promise<boolean>`.

- [ ] **Step 1: Write `src/lib/session.ts`**

```ts
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { getAuth } from "./auth.server";

export const fetchIsAdmin = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getAuth().api.getSession({
      headers: getRequestHeaders(),
    });
    return session?.user.email === env.ADMIN_EMAIL;
  },
);
```

- [ ] **Step 2: Update `src/routes/admin.tsx`**

Current top of file:

```tsx
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { now } from "../lib/clock";
import { dayIndexFor } from "../lib/game-logic";
import { useDarkMode } from "../hooks/useDarkMode";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { fetchR2Logos, type R2Logo } from "../lib/r2-logos";
import {
  fetchLogoMetadata,
  saveLogoMetadata,
  type LogoMetadata,
  type UpsertLogoMetadataInput,
} from "../lib/logo-metadata";
import styles from "./admin.module.css";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw notFound();
    }
  },
  component: AdminPage,
});
```

Replace with:

```tsx
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { now } from "../lib/clock";
import { dayIndexFor } from "../lib/game-logic";
import { useDarkMode } from "../hooks/useDarkMode";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { fetchR2Logos, type R2Logo } from "../lib/r2-logos";
import { fetchIsAdmin } from "../lib/session";
import {
  fetchLogoMetadata,
  saveLogoMetadata,
  type LogoMetadata,
  type UpsertLogoMetadataInput,
} from "../lib/logo-metadata";
import styles from "./admin.module.css";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const isAdmin = await fetchIsAdmin();
    if (!isAdmin) {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminPage,
});
```

(`notFound` was only used by the removed `DEV` check, so it drops out of the import list; `redirect` replaces it.)

- [ ] **Step 3: Add `ADMIN_EMAIL` to `.env.example`**

Append to `apps/web/.env.example`:

```
ADMIN_EMAIL=
```

- [ ] **Step 4: Manual verification (hand to the project owner)**

> Set `ADMIN_EMAIL` in your local `.env` to the email you signed up with in Task 2.
>
> - Open `/admin` in a browser session with no cookies (e.g. an incognito window) → redirected to `/login`.
> - Sign in via `/login` with that same email → lands on `/admin`, page loads normally.
> - Create a second, throwaway account with a different email (repeat Task 2's curl sign-up with a different `email`), sign in as that user, then visit `/admin` → redirected back to `/login` (authenticated, but not the admin).
> - Run `pnpm run build && pnpm run start`, repeat the logged-out check against the production build — the old `DEV`-only bypass must not still be in effect anywhere.

---

## Explicitly out of scope (per spec)

Logout UI, password reset/email verification flows, a registration UI, and provisioning the actual GitHub OAuth App (the project owner's action — once they have a Client ID/Secret and know the production URL, the callback to register is `{BETTER_AUTH_URL}/api/auth/callback/github`).
