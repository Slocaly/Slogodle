# Physics Logo Pile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static `BackgroundLogos` decoration with `PhysicsLogoPile`, a Matter.js-driven pile of logos that falls, collides, and settles at the bottom of the page, and can be dragged/flicked with mouse or touch.

**Architecture:** A pure day-seeded selection utility (`src/lib/dailyRandom.ts`) picks which logos appear. A framework-agnostic Matter.js orchestration module (`src/lib/physicsLogoPile.ts`) owns the engine, boundary walls, mouse dragging, resize handling, and the per-frame DOM sync — it never touches React. A thin React component (`src/components/PhysicsLogoPile.tsx`) renders the SVG logo markup and refs, and wires the physics module in via `useEffect`. No new automated test framework is introduced; this project currently ships with none, and verification for this visual/physics feature is manual (dev server + browser), matching the design spec's testing plan.

**Tech Stack:** React 19, TanStack Start/Router, Matter.js (new dependency), plain CSS custom properties (existing `--accent-*` palette).

## Global Constraints

- No automated test framework exists in this project (`package.json` has only `dev`/`build`/`start` scripts) — do not add one; verify with `pnpm exec tsc --noEmit` plus manual dev-server checks, per the design spec's testing plan.
- Do not run `git add`/`git commit` at any point — the user commits everything themselves (explicit instruction for this session).
- Do not drive the dev server or browser to "verify" on the user's behalf — describe the manual check and let the user perform it.
- Package manager is `pnpm` (lockfile v9, `pnpm@10.16.1`, Node `>=22.12.0` per `package.json` `engines`).
- Follow the design spec at `docs/superpowers/specs/2026-08-13-physics-logo-pile-design.md` exactly (pile band height `33vh`, subset size `12`, day-seed formula `dayIndex * 97 + 13`, closed box with floor/walls/ceiling, vivid solid accent-color fills, reduced-motion skips only the entrance drop).

---

### Task 1: Day-seeded logo subset utility

**Files:**
- Create: `src/lib/dailyRandom.ts`

**Interfaces:**
- Produces: `mulberry32(seed: number): () => number` — deterministic PRNG, returns a function yielding floats in `[0, 1)`.
- Produces: `pickDailySubset<T>(pool: T[], seed: number, count: number): T[]` — deterministically picks up to `count` items from `pool` given `seed`.

- [ ] **Step 1: Write `src/lib/dailyRandom.ts`**

```ts
// src/lib/dailyRandom.ts
export function mulberry32(seed: number) {
  return function random() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickDailySubset<T>(pool: T[], seed: number, count: number): T[] {
  const random = mulberry32(seed)
  const size = Math.min(count, pool.length)
  const start = Math.floor(random() * pool.length)
  const picked: T[] = []
  for (let i = 0; i < size; i++) {
    picked.push(pool[(start + i * 3) % pool.length])
  }
  return picked
}
```

This is the same seeded-pick logic the old `BackgroundLogos.tsx` used inline (`mulberry32(dayIndex * 97 + 13)`, `start + i * 3` stride), extracted so both the selection logic and the RNG are reusable and isolated from React/DOM concerns.

- [ ] **Step 2: Type-check**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no errors mentioning `dailyRandom.ts`.

- [ ] **Step 3: Commit**

Do not commit — per this session's explicit instruction, leave changes uncommitted for the user to review and commit themselves.

---

### Task 2: Matter.js physics engine module

**Files:**
- Modify: `package.json` (add `matter-js` dependency, `@types/matter-js` dev dependency)
- Create: `src/lib/physicsLogoPile.ts`

**Interfaces:**
- Consumes: nothing from Task 1 directly (day-seeding happens in the component, Task 3).
- Produces: `createLogoPileSimulation(options: CreateLogoPileSimulationOptions): LogoPileSimulation`, where:
  ```ts
  interface PileLogo {
    key: string
    aspect: number // viewBox width / viewBox height
  }
  interface CreateLogoPileSimulationOptions {
    container: HTMLElement
    logos: PileLogo[]
    getElement: (key: string) => SVGSVGElement | null
    reducedMotion: boolean
  }
  interface LogoPileSimulation {
    destroy(): void
  }
  ```
  Task 3's component constructs `PileLogo[]` (using each logo's `name` as `key`) and calls `createLogoPileSimulation`, storing the returned `{ destroy }` to call on unmount.

- [ ] **Step 1: Add the dependency**

Add to `package.json`:

```json
  "dependencies": {
    "@tanstack/react-router": "^1.170.25",
    "@tanstack/react-start": "^1.168.42",
    "matter-js": "^0.20.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@types/matter-js": "^0.19.8",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "@vitejs/plugin-react": "^6.0.5",
    "typescript": "^5.9.3",
    "vite": "^8.2.1",
    "vite-tsconfig-paths": "^6.1.1"
  },
```

Run: `pnpm install`
Expected: lockfile updates, `node_modules/matter-js` and `node_modules/@types/matter-js` exist, install exits 0.

- [ ] **Step 2: Write `src/lib/physicsLogoPile.ts`**

```ts
// src/lib/physicsLogoPile.ts
import Matter from 'matter-js'

const WALL_THICKNESS = 60
const BODY_SIZE_MIN = 44
const BODY_SIZE_MAX = 72
const RESIZE_DEBOUNCE_MS = 150

export interface PileLogo {
  key: string
  aspect: number
}

export interface CreateLogoPileSimulationOptions {
  container: HTMLElement
  logos: PileLogo[]
  getElement: (key: string) => SVGSVGElement | null
  reducedMotion: boolean
}

export interface LogoPileSimulation {
  destroy(): void
}

function createBoundaries(width: number, height: number) {
  const options: Matter.IBodyDefinition = { isStatic: true, friction: 0.8 }
  return [
    // floor
    Matter.Bodies.rectangle(width / 2, height + WALL_THICKNESS / 2, width + WALL_THICKNESS * 2, WALL_THICKNESS, options),
    // ceiling
    Matter.Bodies.rectangle(width / 2, -WALL_THICKNESS / 2, width + WALL_THICKNESS * 2, WALL_THICKNESS, options),
    // left wall
    Matter.Bodies.rectangle(-WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height + WALL_THICKNESS * 2, options),
    // right wall
    Matter.Bodies.rectangle(width + WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height + WALL_THICKNESS * 2, options),
  ]
}

export function createLogoPileSimulation(options: CreateLogoPileSimulationOptions): LogoPileSimulation {
  const { container, logos, getElement, reducedMotion } = options
  const engine = Matter.Engine.create()

  let width = container.clientWidth
  let height = container.clientHeight
  let boundaries = createBoundaries(width, height)
  Matter.Composite.add(engine.world, boundaries)

  const pileBodies = logos.flatMap((logo) => {
    const el = getElement(logo.key)
    if (!el) return []

    const longEdge = BODY_SIZE_MIN + Math.random() * (BODY_SIZE_MAX - BODY_SIZE_MIN)
    const bodyWidth = logo.aspect >= 1 ? longEdge : longEdge * logo.aspect
    const bodyHeight = logo.aspect >= 1 ? longEdge / logo.aspect : longEdge
    const x = bodyWidth / 2 + Math.random() * Math.max(width - bodyWidth, 1)
    const y = reducedMotion
      ? height - bodyHeight / 2 - Math.random() * 60
      : -bodyHeight - Math.random() * 300

    el.style.width = `${bodyWidth}px`
    el.style.height = `${bodyHeight}px`

    const body = Matter.Bodies.rectangle(x, y, bodyWidth, bodyHeight, {
      chamfer: { radius: Math.min(bodyWidth, bodyHeight) * 0.18 },
      restitution: 0.15,
      friction: 0.6,
      frictionAir: 0.02,
      angle: Math.random() * Math.PI * 2,
    })

    return [{ body, el, width: bodyWidth, height: bodyHeight }]
  })
  Matter.Composite.add(engine.world, pileBodies.map((entry) => entry.body))

  const mouse = Matter.Mouse.create(container)
  const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  })
  Matter.Composite.add(engine.world, mouseConstraint)

  function sync() {
    for (const { body, el, width: w, height: h } of pileBodies) {
      el.style.transform = `translate(${body.position.x - w / 2}px, ${body.position.y - h / 2}px) rotate(${body.angle}rad)`
    }
  }
  Matter.Events.on(engine, 'afterUpdate', sync)

  const runner = Matter.Runner.create()
  Matter.Runner.run(runner, engine)

  let resizeTimer: ReturnType<typeof setTimeout> | undefined
  function handleResize() {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      Matter.Composite.remove(engine.world, boundaries)
      width = container.clientWidth
      height = container.clientHeight
      boundaries = createBoundaries(width, height)
      Matter.Composite.add(engine.world, boundaries)
    }, RESIZE_DEBOUNCE_MS)
  }
  window.addEventListener('resize', handleResize)

  return {
    destroy() {
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', handleResize)
      Matter.Events.off(engine, 'afterUpdate', sync)
      Matter.Runner.stop(runner)
      Matter.Composite.clear(engine.world, false)
      Matter.Engine.clear(engine)
    },
  }
}
```

- [ ] **Step 3: Type-check**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no errors mentioning `physicsLogoPile.ts` (confirms the `matter-js` types resolve and the Matter.js API calls are used correctly — `Matter.Bodies.rectangle`, `Matter.Composite.add/remove/clear`, `Matter.Mouse.create`, `Matter.MouseConstraint.create`, `Matter.Events.on/off`, `Matter.Runner.create/run/stop`, `Matter.Engine.create/clear` are all valid Matter.js 0.20 APIs).

- [ ] **Step 4: Commit**

Do not commit — per this session's explicit instruction.

---

### Task 3: `PhysicsLogoPile` React component and styling

**Files:**
- Create: `src/components/PhysicsLogoPile.tsx`
- Modify: `src/styles/global.css` (replace `.background-logos`/`.background-logo`/`@keyframes floatLogo` with `.physics-pile`/`.physics-pile-logo`)

**Interfaces:**
- Consumes: `pickDailySubset` from `src/lib/dailyRandom.ts` (Task 1); `createLogoPileSimulation` from `src/lib/physicsLogoPile.ts` (Task 2); `LOGOS` from `src/data/logos.ts` (existing, `{ name, viewBox, svgPath, ... }[]`).
- Produces: `PhysicsLogoPile` component with props `{ dayIndex: number; excludeName: string }` — matches the existing `BackgroundLogos` prop shape so Task 4's swap is a drop-in replacement.

- [ ] **Step 1: Write `src/components/PhysicsLogoPile.tsx`**

```tsx
// src/components/PhysicsLogoPile.tsx
import { useEffect, useMemo, useRef } from 'react'
import { LOGOS } from '../data/logos'
import { pickDailySubset } from '../lib/dailyRandom'
import { createLogoPileSimulation } from '../lib/physicsLogoPile'

const PILE_SIZE = 12
const TINTS = ['var(--accent-pink)', 'var(--accent-mint)', 'var(--accent-yellow)', 'var(--accent-lavender)']

interface PhysicsLogoPileProps {
  dayIndex: number
  excludeName: string
}

function parseAspect(viewBox: string): number {
  const [, , w, h] = viewBox.split(' ').map(Number)
  return w / h
}

export function PhysicsLogoPile({ dayIndex, excludeName }: PhysicsLogoPileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementRefs = useRef(new Map<string, SVGSVGElement>())

  const picked = useMemo(
    () => pickDailySubset(LOGOS.filter((logo) => logo.name !== excludeName), dayIndex * 97 + 13, PILE_SIZE),
    [dayIndex, excludeName],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const simulation = createLogoPileSimulation({
      container,
      logos: picked.map((logo) => ({ key: logo.name, aspect: parseAspect(logo.viewBox) })),
      getElement: (key) => elementRefs.current.get(key) ?? null,
      reducedMotion,
    })

    return () => simulation.destroy()
  }, [picked])

  return (
    <div className="physics-pile" ref={containerRef} aria-hidden="true">
      {picked.map((logo, i) => (
        <svg
          key={logo.name}
          ref={(el) => {
            if (el) elementRefs.current.set(logo.name, el)
            else elementRefs.current.delete(logo.name)
          }}
          className="physics-pile-logo"
          viewBox={logo.viewBox}
          style={{ color: TINTS[i % TINTS.length] }}
          xmlns="http://www.w3.org/2000/svg"
          // svgPath comes from our own static data/logos.ts, never from user input
          dangerouslySetInnerHTML={{ __html: logo.svgPath }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Replace the old background-logo CSS in `src/styles/global.css`**

Find this block (introduced by the in-progress `BackgroundLogos` work):

```css
.background-logos {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.background-logo {
  position: absolute;
  animation: floatLogo 9s ease-in-out infinite;
}

@keyframes floatLogo {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -12px;
  }
}
```

Replace it with:

```css
.physics-pile {
  position: fixed;
  inset: auto 0 0 0;
  height: 33vh;
  z-index: 0;
  overflow: hidden;
  pointer-events: auto;
  touch-action: none;
}

.physics-pile-logo {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}
```

- [ ] **Step 3: Type-check**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no errors mentioning `PhysicsLogoPile.tsx` (confirms prop types, ref callback typing, and the `createLogoPileSimulation`/`pickDailySubset` call sites all line up with Tasks 1–2's signatures).

- [ ] **Step 4: Commit**

Do not commit — per this session's explicit instruction.

---

### Task 4: Swap into the route, remove the old component

**Files:**
- Modify: `src/routes/index.tsx`
- Delete: `src/components/BackgroundLogos.tsx`

**Interfaces:**
- Consumes: `PhysicsLogoPile` from `src/components/PhysicsLogoPile.tsx` (Task 3), same props as the old `BackgroundLogos`.

- [ ] **Step 1: Update `src/routes/index.tsx`**

Change the import:

```diff
-import { BackgroundLogos } from '../components/BackgroundLogos'
+import { PhysicsLogoPile } from '../components/PhysicsLogoPile'
```

Change the usage:

```diff
-      <BackgroundLogos dayIndex={g.dayIndex} excludeName={g.logo.name} />
+      <PhysicsLogoPile dayIndex={g.dayIndex} excludeName={g.logo.name} />
```

- [ ] **Step 2: Delete the old component**

Run: `rm src/components/BackgroundLogos.tsx`

- [ ] **Step 3: Type-check the whole project**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: exits 0, no errors — confirms nothing else references `BackgroundLogos` and the route wiring type-checks.

- [ ] **Step 4: Production build check**

Run: `pnpm run build`
Expected: build completes successfully (this also catches SSR-incompatible browser-only code — `PhysicsLogoPile` must not touch `window`/`document`/Matter.js outside `useEffect`, which it doesn't: `window.matchMedia` and `createLogoPileSimulation` are both called only inside the `useEffect` body, and the route already sets `ssr: false` on `/` in `src/routes/index.tsx:14`).

- [ ] **Step 5: Manual verification (describe for the user — do not drive the browser)**

This is a visual/interactive feature with no automated coverage (per the Global Constraints). Ask the user to run `pnpm run dev`, open the app, and check:
- Logos drop in from above and settle into a pile along the bottom of the screen without jitter or escaping the band.
- Dragging a logo with the mouse moves it and it collides with neighbors; it can't be flung past the invisible ceiling/walls.
- The same drag works with touch (mobile device or Chrome DevTools touch emulation).
- Resizing the browser window repositions the pile boundaries without clipping.
- With `prefers-reduced-motion: reduce` enabled (OS setting or DevTools "Emulate CSS media feature"), reloading shows logos already settled with no drop animation, and dragging still works.
- Changing the simulated day (via whatever dev affordance `useGameState`/`DevtoolsPanel` already exposes for `dayIndex`) changes which 12 logos appear, consistently for a given day.

- [ ] **Step 6: Commit**

Do not commit — per this session's explicit instruction; leave the working tree as-is for the user to review and commit.

---

## Self-Review Notes

- **Spec coverage:** file changes (spec "Component & file changes") → Tasks 3–4; logo selection (spec "Logo selection") → Task 1 + Task 3 Step 1; physics world/boundaries/spawn (spec "Physics world") → Task 2; rendering/DOM sync/fills (spec "Rendering") → Task 2 Step 2 (`sync`) + Task 3 Step 1 (`TINTS`); interaction/mouse+touch (spec "Interaction") → Task 2 Step 2 (`MouseConstraint`); resize (spec "Resize handling") → Task 2 Step 2 (`handleResize`); reduced motion (spec "Reduced motion") → Task 2 Step 2 (`reducedMotion` spawn branch) + Task 3 Step 1 (`matchMedia` check); lifecycle/cleanup (spec "Lifecycle / cleanup") → Task 2 Step 2 (`destroy`); styling (spec "Styling") → Task 3 Step 2; testing plan (spec "Testing plan") → Task 4 Step 5. All spec sections are covered.
- **Placeholder scan:** no TBD/TODO markers; every step has runnable commands or complete code.
- **Type consistency:** `PileLogo { key, aspect }` (Task 2) matches the object shape built in Task 3 Step 1's `.map((logo) => ({ key: logo.name, aspect: parseAspect(logo.viewBox) }))`. `CreateLogoPileSimulationOptions` fields (`container`, `logos`, `getElement`, `reducedMotion`) match the call site exactly. `LogoPileSimulation.destroy()` matches `simulation.destroy()` in Task 3's effect cleanup. Component prop names (`dayIndex`, `excludeName`) match both the old `BackgroundLogos` signature and the Task 4 call site.
