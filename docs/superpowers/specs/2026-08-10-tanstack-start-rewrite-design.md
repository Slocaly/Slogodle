# TanStack Start Rewrite — Design

**Date:** 2026-08-10
**Status:** Approved by user, pending implementation plan

## Goal

Rewrite the "Guess the Logo" game from Astro + vanilla JS to TanStack Start (React), as a learning exercise in the framework. This is a framework migration, not a feature or visual redesign — behavior and appearance should be unchanged when done, except where React/TanStack idioms naturally replace the current DOM-manipulation approach.

## Motivation & constraints

- Primary driver is learning TanStack Start itself (routing, project structure, dev workflow), not a specific feature need. Where reasonable, prefer idiomatic TanStack Start/React patterns over a literal line-for-line port, so the migration is representative of how the framework is normally used.
- The game route is rendered **client-only** (`ssr: false` or equivalent). All game state lives in `localStorage` and depends on the client's clock; there is no server data to justify SSR, and opting out avoids hydration-mismatch workarounds entirely. Routing/file structure is still adopted the TanStack Start way even though there's only one route.
- The in-progress, uncommitted dev-only clock-simulator feature (`clock.js` + `devtools.js`, currently mid-implementation on the Astro codebase) is in scope and gets carried forward into the rewrite, not left behind.
- No test runner is being introduced. The project has none today; verification is manual (the user tests it themselves — see below).
- No commits are made as part of this work; the user commits when ready.

## Architecture / file structure

```
src/
  routes/
    __root.tsx       # HTML document shell: <head>, fonts, theme-flash script, styles import
    index.tsx        # The game route (ssr: false), assembles components
  components/
    GameHeader.tsx      # title, archive toggle, dark-mode toggle
    ArchivePanel.tsx    # past-days list
    LogoCard.tsx         # day label + SVG logo display
    GuessForm.tsx         # input + suggestions + dots + hint
    RevealPanel.tsx       # reveal name/fact, share grid, streak, countdown
    DevtoolsPanel.tsx     # dev-only clock simulator UI
  hooks/
    useGameState.ts   # reducer + effects driving the whole game (replaces initGame())
    useClock.ts       # subscribes to the clock store; dev-only mutators
  lib/
    game-logic.ts     # pure functions ported as-is: dayIndexFor, pickLogo, isCorrectGuess,
                       # suggestionsFor, formatCountdown, nextLocalMidnight, computeStreak
    clock.ts           # clock store (module-level offset), exposed via useSyncExternalStore
                        # (replaces the current window CustomEvent pub/sub)
    storage.ts          # loadJSON/saveJSON localStorage helpers
  data/
    logos.ts           # same content as today, typed as Logo[]
  styles/
    global.css          # ported unchanged (no visual redesign)
```

## State management & data flow

- **`useGameState()`**: a `useReducer` holding `{ dayIndex, logo, value, guesses, status, archiveOpen, dark, now }`, with actions mirroring today's operations 1:1 — `SUBMIT_GUESS`, `SET_VALUE`, `TOGGLE_ARCHIVE`, `TOGGLE_DARK`, `RELOAD_DAY`. `useEffect`s handle: the 1s ticking interval, reacting to clock-store changes (day rollover), and persisting to `localStorage` on guess/theme changes.
- **`useClock()`**: the clock offset becomes a tiny external store consumed via `useSyncExternalStore`, replacing the current module-global + `window.dispatchEvent(new Event("logodle:clock-changed"))` pattern. `DevtoolsPanel` calls mutators (`setSimulatedDate`, `nudgeDays`, `resetClock`), each still guarded by `if (!import.meta.env.DEV) return;`. `useGameState` subscribes to the same store to detect day changes. This is a direct, idiomatic-React swap for the existing pub/sub with no behavior change.
- **Pure logic** (`game-logic.ts`): these functions have no DOM/framework dependency today, so they move over with type annotations only — no logic rewrite.
- **Components are presentational**: they receive state/dispatch (or narrow prop slices) and render JSX instead of building DOM nodes by hand — e.g. `GuessForm`'s suggestion list becomes a `.map()` over JSX instead of manual `createElement`/`appendChild`.
- **Error handling**: `localStorage` reads/writes stay best-effort try/catch, matching current silent-fallback behavior. Not being hardened further — out of scope.

## Styling

- `global.css` is ported byte-for-byte (custom properties, `[data-theme]` selectors), imported once in `__root.tsx`. No visual redesign.
- **Theme-flash prevention**: the current inline `<script is:inline>` (reads `localStorage`, sets `data-theme` before paint) needs an equivalent that runs before hydration/paint via TanStack Start's document-head script mechanism — not a `useEffect`, which would flash unstyled content first.

## Devtools

- `DevtoolsPanel` and its mount stay gated by `import.meta.env.DEV` (same Vite env var mechanism as today), so it's absent from production builds — no behavior change from the current Astro implementation.

## Dependencies & project config

- Add: `@tanstack/react-start`, `@tanstack/react-router`, `react`, `react-dom`, `typescript`, `@types/react`, `@types/react-dom`.
- Remove: `astro`.
- `tsconfig.json`: adjust for React JSX; keep `strict` (already set, previously unused since the code was `.js`).
- `CLAUDE.md`: update the dev-server instructions (currently `astro dev --background` / `astro dev stop/status/logs`) to match TanStack Start's Vite-based dev workflow, so future sessions don't run stale Astro commands.

## Testing / verification

No automated test runner is introduced (matches existing project convention). Verification is manual and done by the user, not driven by Claude: run the dev server, play a full round, check archive/streak/countdown behavior, toggle dark mode, and exercise the devtools panel in the browser.

## Out of scope

- Any visual/UX redesign.
- Introducing a test framework.
- SSR, loaders, or server functions (no server data exists to justify them).
- Changes to `docs/superpowers/plans/*` or `specs/*` historical docs from prior features.
