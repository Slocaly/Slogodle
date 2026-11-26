# Move the Session Cookie to `.slogodle.com` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move an existing host-only login cookie on `tech.slogodle.com` to `.slogodle.com`, so signed-in users are also signed in on `brand.slogodle.com` without signing in again.

**Architecture:** A small wrapper around the Worker's router runs on the `tech.slogodle.com` host only. Once per browser it expires the host-only cookie and re-issues the same signed value with `Domain=.slogodle.com`. No database change: the session stays the same.

**Tech Stack:** TanStack Start on Cloudflare Workers, better-auth 1.7.1, vitest 5, oxlint/oxfmt, pnpm.

---

## Spec

### Problem

Commit `0138f66` made new login cookies carry `Domain=.slogodle.com`. Cookies issued before that deploy are host-only on `tech.slogodle.com`:

1. The browser never sends them to `brand.slogodle.com`.
2. They have the same name as the new cookie, so both can exist at once. The server reads the first one, which is the older one.
3. Sign-out only expires the domain cookie. A dead host-only cookie left behind can make `tech` reject a fresh sign-in, then expire the new cookie.

### Behavior

The wrapper acts only when the request host is `tech.slogodle.com`, it carries at least one `__Secure-better-auth.session_token`, and it has no marker cookie `__Host-slogodle.cookie_moved`.

| Situation | Request passed to the app | Cookies added to the response |
| :-- | :-- | :-- |
| One session cookie, app sets no session cookie | unchanged | expire host-only, re-issue on `.slogodle.com`, marker |
| One session cookie, app sets one (sign-in, sign-out, refresh) | unchanged | expire host-only, marker |
| Two or more session cookies | only the last (newest) one | expire host-only, marker |
| Response is publicly cacheable (`/api/logos/*`) | as above | none |
| Any other case | unchanged | none |

- A single cookie may already be the domain cookie. The header does not say which, and re-issuing it is harmless.
- "Last is newest" relies on browsers listing cookies of equal path oldest first (RFC 6265, section 5.4).
- The re-issued cookie gets a 7-day `Max-Age`. The database `expiresAt` still decides whether the session is valid.
- `dont_remember` and `session_data` cookies are not moved: the app never passes `rememberMe: false` and does not enable the cookie cache.

### Limits

- A user who opens `brand` before revisiting `tech` stays signed out on `brand` until that visit.
- A cookie host-only on `slogodle.com` itself is out of scope.
- `apps/landing` is not touched.

### Deadline

Old cookies last 7 days from their last refresh, and only the old code refreshed them. **The last one expires 7 days after the first production deploy of `0138f66` on `tech`** (call that date `D0`). After `D0 + 7 days` there is nothing left to move. The commit is dated 2026-11-19, so if it was deployed that day, the window closes on 2026-11-26.

## Global Constraints

- Cookie domain is `SHARED_COOKIE_DOMAIN` (`.slogodle.com`) from `apps/web/src/lib/auth-config.ts`.
- Cookie name and lifetime come from better-auth's `getCookies`, not from new literals in production code.
- No `if (brand === …)` checks. The gate is the request hostname.
- No new dependency, no database migration, no change to `apps/landing`.
- `pnpm test` and both builds pass. Tests need a build first, which generates `src/paraglide`.
- `pnpm exec oxlint` reports no new errors. On 2026-11-26 it already reports 3 in `packages/brand-logos/scripts/shuffle-logos.mjs`; leave them.
- Commit messages use the repo's gitmoji style and end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A response that signs the user in or out must never be overridden by the re-issued old value (Task 1).
2. A publicly cacheable response must never carry the session cookie (Task 1).
3. The `brand` host, localhost and `*.workers.dev` must be untouched (Task 1).
4. With a dead old cookie and a good new one, the app must only see the new one (Task 1).

## File Structure

| File | Responsibility |
| :-- | :-- |
| Create `apps/web/src/lib/cookie-move.ts` | The whole temporary migration: gate, request cleanup, response cookies |
| Create `apps/web/src/lib/cookie-move.test.ts` | Behavior tests, one per row of the table |
| Modify `apps/web/src/test/setup.ts` | Let the shared test setup run in the Node environment |
| Modify `apps/web/src/server.ts` | Wrap `route` with `withCookieMove` |

---

### Task 0: Confirm there is something to move (owner)

Needs production access. **Stop the plan if either check fails.**

- [ ] **Step 1: Find `D0`**

Run from `apps/web` (after `pnpm exec wrangler login`):

```bash
pnpm exec wrangler deployments list --name tech-slogodle
```

`D0` is the first deployment that includes `0138f66`. The command only lists recent deployments. Continue only if today is before `D0 + 7 days`, with enough margin to ship. Otherwise every old cookie has expired: users just sign in again, and this plan is not needed.

- [ ] **Step 2: Check the old cookie's name**

In a browser that signed in before `D0`, open DevTools on `https://tech.slogodle.com`, then Application, then Cookies.

Expected: `__Secure-better-auth.session_token` with Domain `tech.slogodle.com` (no leading dot).

If the name has no `__Secure-` prefix, the current code already ignores that cookie. Stop and revisit the spec.

---

### Task 1: The cookie move wrapper

**Files:**
- Create: `apps/web/src/lib/cookie-move.ts`
- Test: `apps/web/src/lib/cookie-move.test.ts`
- Modify: `apps/web/src/test/setup.ts`

**Interfaces:**
- Consumes: `BRANDS` from `../brands`; `buildAuthOptionsFragment(origins: string[], isDev: boolean)` from `./auth-config`.
- Produces: `withCookieMove(request: Request, handle: (request: Request) => Promise<Response>): Promise<Response>`.

- [ ] **Step 1: Let the test setup run without a DOM**

The new tests run in the Node environment, where the shared setup crashes on `localStorage`. In `apps/web/src/test/setup.ts`, replace:

```ts
  localStorage.clear();
```

with:

```ts
  // Absent in tests that opt into the node environment.
  if (typeof localStorage !== "undefined") localStorage.clear();
```

- [ ] **Step 2: Write the failing tests**

Keep the first line: the default `happy-dom` environment follows browser rules and can hide `Cookie` and `Set-Cookie` headers.

```ts
// @vitest-environment node
import { withCookieMove } from "./cookie-move";

const SESSION = "__Secure-better-auth.session_token";
const MARKER = "__Host-slogodle.cookie_moved";
const HOST_ONLY = "Path=/; HttpOnly; Secure; SameSite=Lax";
const EXPIRE_OLD = `${SESSION}=; Max-Age=0; ${HOST_ONLY}`;
const REISSUE = `${SESSION}=abc.sig%3D; Max-Age=604800; Domain=.slogodle.com; ${HOST_ONLY}`;
const SET_MARKER = `${MARKER}=1; Max-Age=2592000; ${HOST_ONLY}`;

async function run(
  cookie: string,
  {
    url = "https://tech.slogodle.com/",
    response = new Response("ok"),
  }: { url?: string; response?: Response } = {},
) {
  const handle = vi.fn(async (_request: Request) => response);
  const result = await withCookieMove(
    new Request(url, { headers: { cookie } }),
    handle,
  );
  return {
    result,
    setCookies: result.headers.getSetCookie(),
    seenCookie: handle.mock.calls[0][0].headers.get("cookie"),
  };
}

describe("withCookieMove", () => {
  it("moves a single session cookie to .slogodle.com, keeping its raw value", async () => {
    const { result, setCookies, seenCookie } = await run(
      `a=1; ${SESSION}=abc.sig%3D`,
    );

    expect(setCookies).toEqual([EXPIRE_OLD, REISSUE, SET_MARKER]);
    expect(seenCookie).toBe(`a=1; ${SESSION}=abc.sig%3D`);
    expect(await result.text()).toBe("ok");
  });

  it("does not re-issue the old value when the app sets the session cookie", async () => {
    const fromApp = `${SESSION}=new; Domain=.slogodle.com; Path=/`;
    const { setCookies } = await run(`${SESSION}=old`, {
      response: new Response("ok", { headers: { "set-cookie": fromApp } }),
    });

    expect(setCookies).toEqual([fromApp, EXPIRE_OLD, SET_MARKER]);
  });

  it("shows the app only the newest cookie when there are two", async () => {
    const { setCookies, seenCookie } = await run(
      `${SESSION}=dead; a=1; ${SESSION}=good`,
    );

    expect(seenCookie).toBe(`a=1; ${SESSION}=good`);
    expect(setCookies).toEqual([EXPIRE_OLD, SET_MARKER]);
  });

  it("keeps the request body when it rewrites the cookies", async () => {
    let body = "";
    await withCookieMove(
      new Request("https://tech.slogodle.com/api/progress/sync", {
        method: "POST",
        headers: { cookie: `${SESSION}=dead; ${SESSION}=good` },
        body: "payload",
      }),
      async (request) => {
        body = await request.text();
        return new Response("ok");
      },
    );

    expect(body).toBe("payload");
  });

  it("adds no cookie to a publicly cacheable response", async () => {
    const { setCookies } = await run(`${SESSION}=abc`, {
      response: new Response("<svg/>", {
        headers: { "cache-control": "public, max-age=31536000, immutable" },
      }),
    });

    expect(setCookies).toEqual([]);
  });

  it.each([
    ["the browser was already moved", `${MARKER}=1; ${SESSION}=abc`, undefined],
    ["there is no session cookie", "a=1", undefined],
    ["the host is brand", `${SESSION}=abc`, "https://brand.slogodle.com/"],
    ["the host is localhost", `${SESSION}=abc`, "http://localhost:3000/"],
    ["the host is workers.dev", `${SESSION}=abc`, "https://x.workers.dev/"],
  ])("does nothing when %s", async (_label, cookie, url) => {
    const { setCookies, seenCookie } = await run(cookie, { url });

    expect(setCookies).toEqual([]);
    expect(seenCookie).toBe(cookie);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm --filter web test -- cookie-move`
Expected: FAIL, `./cookie-move` cannot be resolved.

- [ ] **Step 4: Write the implementation**

```ts
// TEMPORARY. Moves login cookies issued before the shared-cookie deploy
// (host-only on tech.slogodle.com) to .slogodle.com. Old cookies live 7 days at
// most, so delete this file 7 days after that deploy.
// Spec: docs/superpowers/plans/2026-11-26-move-session-cookie.md
import { getCookies } from "better-auth/cookies";
import { BRANDS } from "../brands";
import { buildAuthOptionsFragment } from "./auth-config";

const OLD_HOST = new URL(BRANDS.tech.origin).hostname;
const MARKER = "__Host-slogodle.cookie_moved";
const MARKER_MAX_AGE = 60 * 60 * 24 * 30;
// Without a Domain attribute, a cookie is host-only.
const HOST_ONLY = "Path=/; HttpOnly; Secure; SameSite=Lax";

const { sessionToken } = getCookies(buildAuthOptionsFragment([], false));

export async function withCookieMove(
  request: Request,
  handle: (request: Request) => Promise<Response>,
): Promise<Response> {
  const { name, attributes } = sessionToken;
  const pairs = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((pair) => pair.trim())
    .filter(Boolean);
  const sessions = pairs.filter((pair) => pair.startsWith(`${name}=`));

  if (
    new URL(request.url).hostname !== OLD_HOST ||
    sessions.length === 0 ||
    pairs.some((pair) => pair.startsWith(`${MARKER}=`))
  ) {
    return handle(request);
  }

  // Browsers list same-path cookies oldest first, so the last one is the newest
  // sign-in. better-auth reads the first, so hand it only the newest.
  const newest = sessions.at(-1) as string;
  let forwarded = request;
  if (sessions.length > 1) {
    const headers = new Headers(request.headers);
    const others = pairs.filter((pair) => !pair.startsWith(`${name}=`));
    headers.set("cookie", [...others, newest].join("; "));
    forwarded = new Request(request, { headers });
  }

  const response = await handle(forwarded);
  // A shared cache must never hold a login cookie.
  if (response.headers.get("cache-control")?.includes("public")) {
    return response;
  }

  const headers = new Headers(response.headers);
  const setByApp = headers
    .getSetCookie()
    .some((cookie) => cookie.startsWith(`${name}=`));
  headers.append("set-cookie", `${name}=; Max-Age=0; ${HOST_ONLY}`);
  // With two cookies the domain one already exists. If the app just set or
  // expired the session cookie, its answer wins.
  if (sessions.length === 1 && !setByApp) {
    headers.append(
      "set-cookie",
      `${newest}; Max-Age=${attributes.maxAge}; Domain=${attributes.domain}; ${HOST_ONLY}`,
    );
  }
  headers.append(
    "set-cookie",
    `${MARKER}=1; Max-Age=${MARKER_MAX_AGE}; ${HOST_ONLY}`,
  );
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm --filter web test -- cookie-move`
Expected: PASS, 10 tests.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/cookie-move.ts apps/web/src/lib/cookie-move.test.ts apps/web/src/test/setup.ts
git commit -m "🍪 add the session cookie move to .slogodle.com" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Wire it into the Worker and ship

**Files:**
- Modify: `apps/web/src/server.ts`

**Interfaces:**
- Consumes: `withCookieMove` from Task 1; the existing `route(request: Request): Promise<Response>`.

- [ ] **Step 1: Import the wrapper**

Add below the `./lib/auth.server` import:

```ts
import { withCookieMove } from "./lib/cookie-move";
```

- [ ] **Step 2: Wrap the router**

In `server.fetch`, replace:

```ts
    return withSecurityHeaders(await route(request));
```

with:

```ts
    return withSecurityHeaders(await withCookieMove(request, route));
```

- [ ] **Step 3: Verify**

Run from the repo root:

```bash
pnpm --filter web build:brand && pnpm --filter web build && pnpm test
pnpm exec oxlint
```

Expected: both builds and the tests succeed. Lint shows only the pre-existing errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/server.ts
git commit -m "🍪 move old tech login cookies on the next visit" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Deploy `tech` (owner)**

```bash
pnpm --filter web run deploy
```

`brand` needs no deploy: the wrapper does nothing on its host.

- [ ] **Step 6: Check production**

```bash
curl -sI -H 'Cookie: __Secure-better-auth.session_token=dummy' https://tech.slogodle.com/ | grep -i '^set-cookie'
```

Expected: the expiry of the host-only cookie, a `dummy` cookie with `Domain=.slogodle.com`, and the marker. The same command against `https://brand.slogodle.com/` shows none of them.

Then, in a browser holding an old cookie: reload `tech`, confirm the session cookie's Domain is now `.slogodle.com`, and open `brand`. Expected: signed in. Sign out on `tech`, sign in again, and reload: still signed in.

---

## Follow-up: remove the wrapper

On or after `D0 + 7 days`: delete `apps/web/src/lib/cookie-move.ts` and its test, restore `return withSecurityHeaders(await route(request));` in `apps/web/src/server.ts`, run the Task 2 Step 3 commands, and commit as `🔥 remove the session cookie move`.
