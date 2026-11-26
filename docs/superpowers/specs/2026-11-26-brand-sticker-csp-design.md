# Sticker logos blocked by CSP on brand.slogodle.com — design

## Intent

On `brand.slogodle.com`, the logos in the physics pile do not display: the
Content Security Policy blocks them. Make them display, with their white
"sticker" outline, without changing `tech.slogodle.com`.

## Root cause

- `apps/web/src/lib/stickerIcons.ts` draws each logo on a canvas with a white
  outline and returns a `data:image/png;base64,…` URL.
  `PhysicsLogoPile.tsx` swaps that URL into the pile's `<img>`.
- `apps/web/src/server.ts` sends `img-src 'self'` in production builds, which
  rejects `data:` URLs. The Vite dev server sends no CSP, so the bug does not
  show in dev.
- Both deployments send the same policy. They differ in the build: on
  2026-11-26 the live brand bundle contained the sticker code and the live tech
  bundle did not. This matches `VITE_STICKER_LOGOS=false` being set for tech
  builds only. Where it is set was not found in the repo.

## Goals

- `brand.slogodle.com` shows the pile logos with the sticker outline.
- `tech.slogodle.com` keeps its current appearance (no stickers) and its
  current CSP, unchanged.
- One brand config flag drives both the sticker feature and the CSP allowance,
  so the two cannot disagree.

## Non-goals

- Turning stickers on for `tech`.
- Any other CSP directive. In particular, the built JavaScript also contains
  `data:audio/…` URLs that the current policy would block (`default-src 'self'`).
  Whether this affects sound has not been checked; handle it separately.
- Changing how stickers are drawn, or moving to `blob:` URLs.

## Decisions

1. Stickers are on for `brand` only. The setting lives in the brand config, as
   the multi-brand design requires: code reads the config and never branches on
   a brand name.
2. `img-src` allows `data:` only for brands that have stickers. Rejected:
   allowing it for every brand (loosens `tech` for no benefit), and switching to
   `blob:` URLs (still needs a CSP change, plus URL cleanup code).
3. `VITE_STICKER_LOGOS` is removed, with no override left behind.

## Design

### Brand config — `apps/web/src/brands/index.ts`

`Brand` gains a required field `stickerLogos: boolean`:

| Brand   | `stickerLogos` |
| ------- | -------------- |
| `tech`  | `false`        |
| `brand` | `true`         |

The field is required, so a future brand has to choose.

### CSP — new `apps/web/src/lib/csp.ts`

- Exports `buildCsp(brand: Brand): string`. It holds the directive list now in
  `server.ts`, including the comment explaining `'unsafe-inline'`.
- `img-src` is `'self' data:` when `brand.stickerLogos` is true, and `'self'`
  otherwise. Every other directive stays the same, in the same order.
- The module imports only the `Brand` type, so tests can load it without the
  server entry or Worker bindings.

`server.ts` calls `buildCsp(brand)` with the active brand. It still sends the
header only outside dev (`!import.meta.env.DEV`).

Allowing `data:` in `img-src` applies to image loads only; it does not let
`data:` URLs run as scripts.

### Logo pile — `apps/web/src/components/PhysicsLogoPile.tsx`

Replace the `STICKER_LOGOS` constant (read from `import.meta.env`) with
`brand.stickerLogos`.

### Environment variable

Delete `VITE_STICKER_LOGOS` from `apps/web/.env.example`. A copy still set on a
developer or build machine is ignored.

### Error handling

No change. If building a sticker fails, `getStickerIconSrc` resolves to the
plain icon URL.

## Consequences

- The tech bundle will now include the sticker code, unused, because the flag is
  read at run time from the brand config rather than removed at build time.
- Local dev follows the brand config: `dev` shows no stickers and `dev:brand`
  shows them, whatever `.env` says.

## Testing

Unit tests (`pnpm test`):

- `buildCsp(BRANDS.tech)` contains the directive `img-src 'self'` exactly.
- `buildCsp(BRANDS.brand)` contains the directive `img-src 'self' data:`
  exactly.
- The two policies are otherwise identical.
- `BRANDS.tech.stickerLogos` is `false`; `BRANDS.brand.stickerLogos` is `true`.
- `PhysicsLogoPile` calls `getStickerIconSrc` when the active brand has
  `stickerLogos: true`, and does not when it is `false`. Vitest builds as
  `tech`, so the test mocks the brand module for the `true` case.

Both variants must build (`build` and `build:brand`).

After deploying (dev mode cannot prove this fix, since it sends no CSP):

- `brand.slogodle.com` sends `img-src 'self' data:`; its pile shows outlined
  logos after a win, with no CSP error in the browser console.
- `tech.slogodle.com`, once next deployed, sends `img-src 'self'` and looks as
  before.
