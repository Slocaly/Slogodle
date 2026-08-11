# Day Simulator Devtool — Design

## Summary

A dev-only panel that lets the developer jump the game's notion of "today" to any
date, so day rotation, streaks, archive state, and countdown/rollover behavior can be
tested without waiting for real days to pass. Not present in production builds, and
its underlying clock-mutation functions are inert if somehow reached outside dev.

## Scope decisions

- **Goal:** exercise any day's puzzle/state end-to-end (not just a narrow
  rollover-boundary check).
- **Access:** hidden panel, dev-only — present only under `astro dev`, entirely absent
  from `astro build` output.
- **Override scope:** full override. The simulated date becomes the effective "now"
  everywhere — `dayIndex`, countdown, archive, streak, and localStorage reads/writes
  all behave exactly as if that were the real date (including resuming saved progress
  for that day, if any).
- **Persistence:** resets to real time on every page reload. No storage of the
  simulated offset — simplest, and avoids silently staying in sim mode across
  sessions.
- **Out of scope:** persisting the simulated date across reloads, any prod-facing UI,
  automated tests (project has none; manual verification only, per existing
  convention).

## Architecture & file layout

- **`src/scripts/clock.js`** (new) — single source of "now" for the whole app.
  - `now()` — returns `new Date(Date.now() + offsetMs)`; `offsetMs` is a module-level
    variable, starts at `0`.
  - `setSimulatedDate(date)`, `nudgeDays(n)`, `resetClock()`, `isSimulated()` —
    mutate/query `offsetMs`. Each mutator is guarded by
    `if (!import.meta.env.DEV) return;` as defense-in-depth: even if these exports
    were ever reachable outside the dev-only devtools panel (e.g. a future refactor
    accidentally imports them elsewhere), they're no-ops in a production build rather
    than live footguns.
  - Setting the offset dispatches `window.dispatchEvent(new Event("logodle:clock-changed"))`.
- **`src/scripts/game.js`** (edit) — replace the `new Date()` / `Date.now()` call
  sites (`initGame`'s `dayIndex` computation, `nextLocalMidnight()` calls, the 1s
  countdown tick) with `clock.now()`. Extract the state-rebuilding portion of
  `initGame` (recompute `dayIndex`/`logo`/`guesses`/`status`/`history` from storage
  via `clock.now()`, then `render()`) into a `reloadDay()` function. DOM event
  listeners remain wired exactly once, at `initGame` time; a
  `window.addEventListener("logodle:clock-changed", reloadDay)` listener is added
  once alongside them so a clock change re-derives state without duplicating
  listeners.
- **`src/scripts/devtools.js`** (new) — mounts the floating panel and wires its
  controls directly to `clock.js`'s exports. Has no knowledge of `game.js` internals;
  the `logodle:clock-changed` event is the only coupling.
- **`src/pages/index.astro`** (edit) — the panel markup and its mounting `<script>`
  are both wrapped in `{import.meta.env.DEV && (...)}`, so Vite excludes
  `devtools.js` from the production bundle entirely (nothing imports it outside that
  conditional). `clock.js` itself still ships in prod (via `game.js`'s `now()`
  import), but its mutator exports are unused outside `devtools.js` and are expected
  to be tree-shaken from the production bundle; the `import.meta.env.DEV` guard
  inside them is the backstop regardless of whether tree-shaking removes them.

## UI

A small collapsed "🛠" button pinned bottom-right, dev-only. Expands to:

- Current simulated date readout (or "Real time" when unsimulated).
- `<input type="date">` + "Jump" button.
- "−1 day" / "+1 day" nudge buttons.
- "Reset to now" button.

Styled with the existing CSS custom properties (`src/styles/global.css`) so it
respects the light/dark theme toggle already in the app.

## Behavior notes

- Jumping to a date via the date picker preserves the current real time-of-day (only
  the date part changes), so the countdown timer shows a sensible remaining time
  instead of always reading near `00:00:00`.
- The countdown ticker keeps advancing in simulated time after a jump (it re-reads
  `clock.now()` every second), so leaving the panel open will actually carry the game
  across a simulated local midnight — useful for rollover testing without extra
  plumbing.
- Dates before the epoch or wrapping past the end of the logo bank already work via
  existing modulo/guard logic in `pickLogo`/the archive loop — no new special-casing
  needed.

## Testing

Manual verification only, via `astro dev --background` (matches this project's
existing convention — no automated test runner). Verify: jumping forward/backward
changes the logo/day label; resuming a previously-completed simulated day restores
its saved result; archive strip and streak reflect the simulated date; countdown
continues ticking and correctly rolls the day over if left running past a simulated
midnight; reloading the page returns to real time; and the panel/button are absent
from `astro build` output (`dist/`).
