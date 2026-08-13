# Physics Logo Pile — Design

## Summary

Replace the existing `BackgroundLogos` component (a subtle, statically-scattered
set of floating logos around the page edges) with `PhysicsLogoPile`: a real
physics simulation where a day-seeded subset of logos falls, collides, and
settles into an interactive pile along the bottom of the page.

## Goals

- Logos genuinely fall under gravity and collide/stack into a pile at the
  bottom of the screen — not a faked CSS animation.
- The pile is playable: mouse and touch can drag/flick logos around inside
  the pile.
- The pile never visually interferes with the centered game card.
- Which logos appear (and their order/positions) is deterministic per day,
  consistent with the existing day-seeded pattern in the codebase.

## Non-goals

- No gameplay impact — this is purely decorative/ambient, same as the
  component it replaces.
- No persistence of pile state across reloads/interactions.
- No mobile-specific layout redesign beyond making touch dragging work.

## Component & file changes

- Delete `src/components/BackgroundLogos.tsx`; add
  `src/components/PhysicsLogoPile.tsx` with the same public props:
  `{ dayIndex: number; excludeName: string }`.
- `src/routes/index.tsx`: swap `<BackgroundLogos ... />` for
  `<PhysicsLogoPile ... />` (same call site, same props).
- `src/styles/global.css`: remove `.background-logos`, `.background-logo`,
  and `@keyframes floatLogo`; add new styles for the pile container and
  logo tiles (see "Styling" below).
- `package.json`: add `matter-js` as a runtime dependency and
  `@types/matter-js` as a dev dependency.

## Logo selection

Reuse the existing day-seeded RNG pattern (`mulberry32(dayIndex * 97 + 13)`
from the old `BackgroundLogos`):

- Filter `LOGOS` to exclude the current day's answer (`excludeName`).
- Deterministically pick **12** logos from the remaining pool using the
  seeded RNG, the same way the old component picked scatter slots.
- This keeps the pile's composition stable for a given day (consistent
  across re-renders/navigation) while varying day to day.

## Physics world

- A `Matter.Engine` + `Matter.Runner` is created on mount, scoped to a
  container `<div>` that is `position: fixed; inset: auto 0 0 0; height:
  33vh; width: 100vw` (the "pile band"), `z-index: 0` so it sits behind
  `.page` content exactly like the old background layer did.
- Static boundary bodies define a fully closed box within the band: floor,
  left wall, right wall, and a **ceiling** at the top of the band. The
  ceiling exists specifically so that dragging/flicking a logo can't launch
  it up into the game card — the pile is contained even under interaction.
- Each logo becomes a `Matter.Bodies.rectangle`, sized from its `viewBox`
  aspect ratio (roughly 44–72px on the long edge), with `chamfer` for
  rounded corners, moderate `restitution` (slight bounce) and `friction`
  high enough that the pile settles rather than sliding indefinitely.
- Spawn: each body starts just above the band (small negative y offset,
  random x within the band width, random initial rotation) and falls in
  under gravity when the engine starts, colliding with the floor, walls,
  and each other until the pile settles.

## Rendering

- Each logo is rendered as a real `<svg>` element (same `viewBox` and
  `svgPath` markup as the current logo data), absolutely positioned inside
  the band container, one `ref` per logo.
- A single `requestAnimationFrame` loop runs alongside the `Matter.Runner`.
  Each frame, it reads every body's `position` and `angle` directly from
  the Matter world and writes them to the corresponding SVG element's
  `style.transform` (`translate(...) rotate(...)`). This happens entirely
  outside React state/render — React never re-renders during the
  simulation, only on mount/unmount and prop changes (`dayIndex`,
  `excludeName`).
- Fill color: solid, full-opacity, cycling through the existing
  `--accent-pink` / `--accent-mint` / `--accent-yellow` / `--accent-lavender`
  custom properties (same palette already used elsewhere in the redesign),
  one per logo body.

## Interaction

- A `Matter.Mouse` is attached to the band container and wired into a
  `Matter.MouseConstraint` on the engine, giving native drag support for
  both mouse and touch pointers (Matter's mouse module handles touch events
  out of the box).
- `pointer-events` is enabled only on the band container itself. This is
  safe because the band is confined to the bottom 33vh and doesn't overlap
  the header, archive panel, or centered game card, so the rest of the page
  remains fully clickable.

## Resize handling

- On window resize (debounced ~150ms), recompute the band's pixel
  dimensions and reposition/resize the four boundary bodies (floor, walls,
  ceiling) to match, so the pile never clips outside the visible band or
  floats in space after a viewport change. Logo bodies are left as-is (the
  engine will naturally resettle them against the moved boundaries).

## Reduced motion

- Under `prefers-reduced-motion: reduce`, skip the "fall from above"
  entrance: bodies are placed directly into a settled resting arrangement
  along the floor (still with slight random x/rotation for a natural look)
  instead of starting above the band and animating down.
- The engine keeps running and drag interaction remains available — only
  the automatic entrance motion is suppressed, consistent with how the
  rest of the app already treats reduced-motion (see the existing global
  `@media (prefers-reduced-motion: reduce)` block in `global.css`, which
  targets CSS animations and doesn't affect this JS-driven simulation, so
  this is handled explicitly in the component).

## Lifecycle / cleanup

- On unmount: cancel the `requestAnimationFrame` loop, stop the
  `Matter.Runner`, and clear the engine's world/bodies to avoid leaking
  timers or listeners (relevant for HMR during development and for
  route/theme changes that might remount the tree).

## Styling

- `.physics-pile` container: `position: fixed; inset: auto 0 0 0; height:
  33vh; overflow: hidden; z-index: 0;` (pointer-events enabled, unlike the
  old fully pointer-events:none background layer).
- `.physics-pile-logo`: `position: absolute; top: 0; left: 0;` with no
  transition on transform (the rAF loop updates it every frame; a CSS
  transition would fight the physics-driven updates).
- Existing `.page` already has `position: relative; z-index: 1`, so no
  change needed there — the pile stays visually behind page content outside
  the band, consistent with the current layering.

## Testing plan

- Manual verification only (per project convention — no automated test
  suite exists for visual/physics behavior):
  - Load the page, confirm logos drop in and settle into a pile without
    jitter or escaping the band.
  - Drag/flick a logo with mouse; confirm it collides with others and
    can't escape past the ceiling/walls.
  - Repeat on a touch device/emulator.
  - Resize the window; confirm the pile repositions against the new bounds
    without clipping.
  - Toggle `prefers-reduced-motion` (OS or devtools) and reload; confirm
    logos appear already settled with no drop animation, and dragging still
    works.
  - Reload on a couple of different days (or fake `dayIndex`) to confirm
    the logo subset changes deterministically.
