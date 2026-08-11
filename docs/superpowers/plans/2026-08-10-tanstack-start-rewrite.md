# TanStack Start Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the "Guess the Logo" game from Astro + vanilla JS to TanStack Start (React + TypeScript), preserving current behavior and appearance exactly, as a learning exercise in the framework.

**Architecture:** File-based TanStack Start routing with a single client-only route (`ssr: false`). Game state moves from an imperative `initGame()` DOM-manipulation closure to a `useGameState()` hook (`useReducer` + effects) consumed by small presentational components. The existing pure logic functions and CSS port over unchanged; the clock-simulator devtool's `window` `CustomEvent` pub/sub is replaced with a `useSyncExternalStore`-based store, its React-idiomatic equivalent.

**Tech Stack:** TanStack Start, TanStack Router, React 19, TypeScript, Vite. Removes: Astro.

Spec reference: `docs/superpowers/specs/2026-08-10-tanstack-start-rewrite-design.md`

## Global Constraints

- Client-only rendering for the game route: `ssr: false` on the `/` route. No loaders, no server functions — there is no server data.
- No test runner is introduced. Pure-function tasks are verified with a throwaway `npx tsx` script that is deleted before the task ends, never committed. UI/behavior verification is manual and done by the user afterward (see Task 14) — do not launch the dev server and drive it via browser automation as "verification" for tasks in this plan.
- Do not create git commits during implementation — the user reviews and commits everything themselves. Leave the working tree as-is at the end of each task; do not run `git add` / `git commit`.
- Devtools (`DevtoolsPanel`, `clock.ts`'s mutating exports) stay gated by `import.meta.env.DEV`, exactly matching current behavior — absent from production builds.
- CSS is ported unchanged. `src/styles/global.css` stays at its current path and content; only its import site changes (from the Astro page frontmatter to the TanStack Start root route). Do not edit its rules.
- Preserve existing localStorage key names exactly: `logodle_today_v1`, `logodle_history_v1`, `logodle_dark_v1`. Changing them would silently reset every existing player's progress/streak.
- Preserve existing DOM class names exactly (e.g. `guess-tile`, `share-cell`, `archive-dot`) since `global.css` selects on them and is not being modified.
- `pickLogo`, `isCorrectGuess`, `suggestionsFor`, `dayIndexFor`, `formatCountdown`, `nextLocalMidnight`, `computeStreak` move to `src/lib/game-logic.ts` as direct type-annotated ports — no logic changes, since they have no DOM dependency today.

---

### Task 1: Scaffold TanStack Start project

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/router.tsx`
- Create: `src/routes/__root.tsx`
- Create: `src/routes/index.tsx` (placeholder, replaced in Task 12)
- Delete: nothing yet (old Astro files removed in Task 13, after the new app is verified working)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a buildable TanStack Start skeleton. Later tasks add files under `src/lib/`, `src/hooks/`, `src/components/` and replace the placeholder `src/routes/index.tsx`.

- [ ] **Step 1: Remove Astro, add TanStack Start + React dependencies**

Run:
```bash
npm uninstall astro
npm install @tanstack/react-start @tanstack/react-router react react-dom
npm install -D @types/react @types/react-dom typescript vite @vitejs/plugin-react vite-tsconfig-paths
```

- [ ] **Step 2: Update `package.json` scripts**

Edit the `"scripts"` block to:
```json
{
  "dev": "vite dev",
  "build": "vite build",
  "start": "vite preview"
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ['./tsconfig.json'] }),
    tanstackStart(),
    viteReact(),
  ],
})
```

- [ ] **Step 4: Replace `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

(The old tsconfig extended `astro/tsconfigs/strict`, which no longer exists once `astro` is uninstalled — this replaces it with an equivalent strict, Vite/React-flavored config.)

- [ ] **Step 5: Create `src/router.tsx`**

```tsx
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function createRouter() {
  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
```

- [ ] **Step 6: Create `src/routes/__root.tsx`**

This ports the current `<head>` contents from `src/pages/index.astro` (charset, favicon links, viewport, Google Fonts, the theme-flash-prevention inline script) plus the global stylesheet import.

```tsx
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import globalCss from '../styles/global.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width' },
      { title: 'Guess the Logo' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      },
      { rel: 'stylesheet', href: globalCss },
    ],
    scripts: [
      {
        children: `try {
  var v = localStorage.getItem('logodle_dark_v1');
  document.documentElement.dataset.theme = v === '1' ? 'dark' : 'light';
} catch (e) {}`,
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Create placeholder `src/routes/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  ssr: false,
  component: Home,
})

function Home() {
  return <div>TanStack Start scaffold OK</div>
}
```

- [ ] **Step 8: Verify the scaffold builds**

Run: `npm run build`
Expected: build succeeds with no errors. If the installed TanStack Start version's API differs from a step above (e.g. a different plugin import path, or `ssr` living in a different option shape), fix the specific file based on the compiler/build error — the error message will name the exact mismatch.

---

### Task 2: Port logo data (`src/data/logos.ts`)

**Files:**
- Create: `src/data/logos.ts`
- (Reference, not modified: `src/data/logos.js` stays until Task 13 cleanup)

**Interfaces:**
- Consumes: nothing
- Produces: `export interface Logo { name: string; aliases: string[]; industry: string; founded: number; funFact: string; viewBox: string; svgPath: string }` and `export const LOGOS: Logo[]`. Used by Task 3 (`game-logic.ts`), Task 6 (`useGameState`), and all UI component tasks.

- [ ] **Step 1: Create the typed data file**

Copy the array literal from `src/data/logos.js` verbatim (all 15 logo entries, unchanged field values) into a new typed file:

```ts
// src/data/logos.ts
export interface Logo {
  name: string
  aliases: string[]
  industry: string
  founded: number
  funFact: string
  viewBox: string
  svgPath: string
}

export const LOGOS: Logo[] = [
  // ... copy every entry from src/data/logos.js unchanged ...
]
```

Use the Read tool on `src/data/logos.js` and copy its 15 entries exactly (Vue.js, Mastercard, Target, Adidas, Pinterest, Spotify, YouTube, Bluetooth, X (Twitter), WordPress, Slack, Netflix, npm, Chrome, Instagram, Google Maps) — do not paraphrase or alter any `svgPath`, `viewBox`, `aliases`, or `funFact` value.

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/data/logos.ts`.

---

### Task 3: Port pure game logic (`src/lib/game-logic.ts`)

**Files:**
- Create: `src/lib/game-logic.ts`
- Create (temporary, deleted at end of task): `src/lib/__scratch-game-logic.ts`

**Interfaces:**
- Consumes: `Logo` from `../data/logos` (Task 2)
- Produces:
  - `export type GameStatus = 'playing' | 'won' | 'lost'`
  - `export interface Guess { text: string; correct: boolean }`
  - `export function dayIndexFor(date: Date, epoch?: Date): number`
  - `export function pickLogo(bank: Logo[], dayIndex: number): Logo`
  - `export function isCorrectGuess(text: string, logo: Logo): boolean`
  - `export function suggestionsFor(value: string, bank: Logo[], excludeName: string | null): string[]`
  - `export function formatCountdown(ms: number): string`
  - `export function nextLocalMidnight(from?: Date): Date`
  - `export function computeStreak(history: Record<string, GameStatus>, todayIndex: number): number`
  - These are consumed by Task 6 (`useGameState`) and by `GuessForm`/`RevealPanel` (Tasks 8–9).

- [ ] **Step 1: Write the ported module**

```ts
// src/lib/game-logic.ts
import type { Logo } from '../data/logos'

const EPOCH = new Date(2024, 0, 1)

export type GameStatus = 'playing' | 'won' | 'lost'

export interface Guess {
  text: string
  correct: boolean
}

function localMidnight(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function dayIndexFor(date: Date, epoch: Date = EPOCH): number {
  const ms = localMidnight(date).getTime() - localMidnight(epoch).getTime()
  return Math.floor(ms / 86400000)
}

export function pickLogo(bank: Logo[], dayIndex: number): Logo {
  const i = ((dayIndex % bank.length) + bank.length) % bank.length
  return bank[i]
}

export function isCorrectGuess(text: string, logo: Logo): boolean {
  const q = text.trim().toLowerCase()
  return logo.aliases.includes(q)
}

export function suggestionsFor(value: string, bank: Logo[], excludeName: string | null): string[] {
  if (!value || value.trim().length < 1) return []
  const q = value.trim().toLowerCase()
  return bank
    .map((l) => l.name)
    .filter((name) => name.toLowerCase().startsWith(q) && name !== excludeName)
    .slice(0, 4)
}

export function formatCountdown(ms: number): string {
  const clamped = Math.max(0, ms)
  const s = Math.floor(clamped / 1000)
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export function nextLocalMidnight(from: Date = new Date()): Date {
  const d = localMidnight(from)
  d.setDate(d.getDate() + 1)
  return d
}

export function computeStreak(history: Record<string, GameStatus>, todayIndex: number): number {
  let i = todayIndex
  if (history[String(i)] === undefined) i -= 1
  let streak = 0
  while (history[String(i)] === 'won') {
    streak += 1
    i -= 1
  }
  return streak
}
```

- [ ] **Step 2: Write a throwaway sanity-check script**

```ts
// src/lib/__scratch-game-logic.ts
import { dayIndexFor, pickLogo, isCorrectGuess, suggestionsFor, formatCountdown, computeStreak } from './game-logic'
import { LOGOS } from '../data/logos'

const epoch = new Date(2024, 0, 1)
console.assert(dayIndexFor(new Date(2024, 0, 1), epoch) === 0, 'dayIndexFor day 0')
console.assert(dayIndexFor(new Date(2024, 0, 2), epoch) === 1, 'dayIndexFor day 1')

const logo = pickLogo(LOGOS, 0)
console.assert(logo === LOGOS[0], 'pickLogo wraps to bank[0] at index 0')
console.assert(pickLogo(LOGOS, LOGOS.length) === LOGOS[0], 'pickLogo wraps modulo bank length')

console.assert(isCorrectGuess(' Vue ', LOGOS[0]) === true, 'isCorrectGuess trims/lowercases')
console.assert(isCorrectGuess('nope', LOGOS[0]) === false, 'isCorrectGuess rejects wrong answer')

console.assert(suggestionsFor('sp', LOGOS, null).includes('Spotify'), 'suggestionsFor prefix match')
console.assert(formatCountdown(3661000) === '01:01:01', 'formatCountdown formats hh:mm:ss')

console.assert(computeStreak({ '5': 'won', '4': 'won', '3': 'lost' }, 5) === 2, 'computeStreak counts back-to-back wins')

console.log('game-logic sanity checks passed')
```

- [ ] **Step 3: Run the sanity check**

Run: `npx tsx src/lib/__scratch-game-logic.ts`
Expected output: `game-logic sanity checks passed` with no `Assertion failed` lines printed above it.

- [ ] **Step 4: Delete the scratch file**

Run: `rm src/lib/__scratch-game-logic.ts`

---

### Task 4: Port storage helpers (`src/lib/storage.ts`)

**Files:**
- Create: `src/lib/storage.ts`
- Create (temporary, deleted at end of task): `src/lib/__scratch-storage.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `export function loadJSON<T>(key: string, fallback: T): T` and `export function saveJSON<T>(key: string, value: T): void`. Used by Task 6 (`useGameState`).

- [ ] **Step 1: Write the module**

```ts
// src/lib/storage.ts
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch (e) {
    return fallback
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // best-effort persistence, matches current behavior
  }
}
```

- [ ] **Step 2: Write and run a throwaway sanity check**

```ts
// src/lib/__scratch-storage.ts
import { loadJSON, saveJSON } from './storage'

// jsdom-free sanity check: without a real localStorage this exercises the try/catch fallback path.
const result = loadJSON('nonexistent_key_xyz', { ok: true })
console.assert(result.ok === true, 'loadJSON returns fallback when key is missing or localStorage is unavailable')
saveJSON('nonexistent_key_xyz', { ok: true }) // must not throw even without a DOM
console.log('storage sanity checks passed')
```

Run: `npx tsx src/lib/__scratch-storage.ts`
Expected: `storage sanity checks passed`.

- [ ] **Step 3: Delete the scratch file**

Run: `rm src/lib/__scratch-storage.ts`

---

### Task 5: Clock store + `useClock` hook

**Files:**
- Create: `src/lib/clock.ts`
- Create: `src/hooks/useClock.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `src/lib/clock.ts`: `export function now(): Date`, `export function isSimulated(): boolean`, `export function setSimulatedDate(date: Date): void`, `export function nudgeDays(n: number): void`, `export function resetClock(): void`, `export function subscribe(listener: () => void): () => void`, `export function getSnapshot(): number`
  - `src/hooks/useClock.ts`: `export function useClock(): { now, isSimulated, setSimulatedDate, nudgeDays, resetClock }` — re-renders the calling component whenever the clock offset changes.
  - Used by Task 6 (`useGameState`, via `subscribe`/`now`) and Task 11 (`DevtoolsPanel`, via `useClock` and the mutators).

- [ ] **Step 1: Write `src/lib/clock.ts`**

This replaces the current `window.dispatchEvent(new Event("logodle:clock-changed"))` pub/sub with a plain listener-set store, so it can be consumed via React's `useSyncExternalStore` instead of a DOM event.

```ts
// src/lib/clock.ts
type Listener = () => void

let offsetMs = 0
const listeners = new Set<Listener>()

function emitChange() {
  for (const listener of listeners) listener()
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): number {
  return offsetMs
}

export function now(): Date {
  return new Date(Date.now() + offsetMs)
}

export function isSimulated(): boolean {
  return offsetMs !== 0
}

function applyOffset(targetDate: Date) {
  offsetMs = targetDate.getTime() - Date.now()
  emitChange()
}

export function setSimulatedDate(date: Date): void {
  if (!import.meta.env.DEV) return
  applyOffset(date)
}

export function nudgeDays(n: number): void {
  if (!import.meta.env.DEV) return
  applyOffset(new Date(now().getTime() + n * 86400000))
}

export function resetClock(): void {
  if (!import.meta.env.DEV) return
  offsetMs = 0
  emitChange()
}
```

- [ ] **Step 2: Write `src/hooks/useClock.ts`**

```tsx
// src/hooks/useClock.ts
import { useSyncExternalStore } from 'react'
import { subscribe, getSnapshot, now, isSimulated, setSimulatedDate, nudgeDays, resetClock } from '../lib/clock'

export function useClock() {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return { now, isSimulated, setSimulatedDate, nudgeDays, resetClock }
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors in `src/lib/clock.ts` or `src/hooks/useClock.ts`. (Behavior is verified end-to-end once `DevtoolsPanel` wires it up in Task 11, and manually by the user in Task 14 — `useSyncExternalStore` and DOM-dependent `import.meta.env.DEV` checks aren't meaningfully testable outside a running app.)

---

### Task 6: `useGameState` hook

**Files:**
- Create: `src/hooks/useGameState.ts`

**Interfaces:**
- Consumes: `LOGOS`, `Logo` (Task 2); `dayIndexFor`, `pickLogo`, `isCorrectGuess`, `computeStreak`, `Guess`, `GameStatus` (Task 3); `loadJSON`, `saveJSON` (Task 4); `now`, `subscribe` (Task 5)
- Produces: `export function useGameState()` returning:
  ```ts
  {
    dayIndex: number
    logo: Logo
    guesses: Guess[]
    status: GameStatus
    value: string
    setValue: (value: string) => void
    submitGuess: (text: string) => void
    archiveOpen: boolean
    toggleArchive: () => void
    dark: boolean
    toggleDark: () => void
    history: Record<string, GameStatus>
    streak: number
    maxTries: number
  }
  ```
  Consumed by Task 12 (`src/routes/index.tsx`), which passes these fields down as props to every component built in Tasks 7–11.

- [ ] **Step 1: Write the hook**

```ts
// src/hooks/useGameState.ts
import { useEffect, useReducer, useState } from 'react'
import { LOGOS, type Logo } from '../data/logos'
import { loadJSON, saveJSON } from '../lib/storage'
import { now, subscribe as subscribeClock } from '../lib/clock'
import { dayIndexFor, pickLogo, isCorrectGuess, computeStreak, type Guess, type GameStatus } from '../lib/game-logic'

const MAX_TRIES = 3
const TODAY_KEY = 'logodle_today_v1'
const HISTORY_KEY = 'logodle_history_v1'
const DARK_KEY = 'logodle_dark_v1'

interface DayState {
  dayIndex: number
  logo: Logo
  guesses: Guess[]
  status: GameStatus
}

interface SavedToday {
  dayIndex: number
  guesses: Guess[]
  status: GameStatus
}

function loadDay(): DayState {
  const dayIndex = dayIndexFor(now())
  const logo = pickLogo(LOGOS, dayIndex)
  const saved = loadJSON<SavedToday | null>(TODAY_KEY, null)
  const resuming = saved !== null && saved.dayIndex === dayIndex
  return {
    dayIndex,
    logo,
    guesses: resuming ? saved!.guesses : [],
    status: resuming ? saved!.status : 'playing',
  }
}

type Action = { type: 'RELOAD_DAY' } | { type: 'SUBMIT_GUESS'; text: string }

function reducer(state: DayState, action: Action): DayState {
  switch (action.type) {
    case 'RELOAD_DAY':
      return loadDay()
    case 'SUBMIT_GUESS': {
      if (state.status !== 'playing' || !action.text.trim()) return state
      const correct = isCorrectGuess(action.text, state.logo)
      const guesses = [...state.guesses, { text: action.text.trim(), correct }]
      const status: GameStatus = correct ? 'won' : guesses.length >= MAX_TRIES ? 'lost' : 'playing'
      return { ...state, guesses, status }
    }
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, undefined, loadDay)
  const [history, setHistory] = useState<Record<string, GameStatus>>(() => loadJSON(HISTORY_KEY, {}))
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DARK_KEY) === '1'
    } catch (e) {
      return false
    }
  })
  const [value, setValue] = useState('')
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [, forceTick] = useState(0)

  // Persist today's progress, and fold a finished day into history, whenever they change.
  useEffect(() => {
    saveJSON(TODAY_KEY, { dayIndex: state.dayIndex, guesses: state.guesses, status: state.status })
    if (state.status !== 'playing' && history[String(state.dayIndex)] !== state.status) {
      setHistory((h) => {
        const next = { ...h, [String(state.dayIndex)]: state.status }
        saveJSON(HISTORY_KEY, next)
        return next
      })
    }
  }, [state.dayIndex, state.guesses, state.status])

  // Persist dark-mode preference and reflect it on <html data-theme>.
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    try {
      localStorage.setItem(DARK_KEY, dark ? '1' : '0')
    } catch (e) {
      // best-effort, matches current behavior
    }
  }, [dark])

  // Tick every second; reload the day if it has rolled over since the last tick.
  useEffect(() => {
    const id = setInterval(() => {
      if (dayIndexFor(now()) !== state.dayIndex) {
        dispatch({ type: 'RELOAD_DAY' })
        setValue('')
      } else {
        forceTick((t) => t + 1)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [state.dayIndex])

  // React to devtools clock changes immediately, not just on the next 1s tick.
  useEffect(
    () =>
      subscribeClock(() => {
        dispatch({ type: 'RELOAD_DAY' })
        setValue('')
      }),
    [],
  )

  const streak = computeStreak(history, state.dayIndex)

  function submitGuess(text: string) {
    dispatch({ type: 'SUBMIT_GUESS', text })
    setValue('')
  }

  return {
    dayIndex: state.dayIndex,
    logo: state.logo,
    guesses: state.guesses,
    status: state.status,
    value,
    setValue,
    submitGuess,
    archiveOpen,
    toggleArchive: () => setArchiveOpen((v) => !v),
    dark,
    toggleDark: () => setDark((d) => !d),
    history,
    streak,
    maxTries: MAX_TRIES,
  }
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors in `src/hooks/useGameState.ts`. (This hook's runtime behavior — day rollover, persistence, streak math — is exercised end-to-end once wired into the route in Task 12, and verified manually by the user in Task 14; it isn't meaningfully unit-testable without a DOM/localStorage and without introducing a test runner, which is out of scope per the Global Constraints.)

---

### Task 7: `LogoCard` and `GuessTiles` components

**Files:**
- Create: `src/components/LogoCard.tsx`
- Create: `src/components/GuessTiles.tsx`

**Interfaces:**
- Consumes: `Logo` (Task 2), `GameStatus`, `Guess` (Task 3)
- Produces: `export function LogoCard(props: { dayIndex: number; status: GameStatus; logo: Logo }): JSX.Element` and `export function GuessTiles(props: { guesses: Guess[] }): JSX.Element`. Consumed by Task 12.

- [ ] **Step 1: Write `LogoCard.tsx`**

```tsx
// src/components/LogoCard.tsx
import type { Logo } from '../data/logos'
import type { GameStatus } from '../lib/game-logic'

interface LogoCardProps {
  dayIndex: number
  status: GameStatus
  logo: Logo
}

export function LogoCard({ dayIndex, status, logo }: LogoCardProps) {
  const label =
    status === 'playing'
      ? `GUESS THE LOGO · #${dayIndex + 1}`
      : status === 'won'
        ? `SOLVED — #${dayIndex + 1}`
        : `MISSED — #${dayIndex + 1}`

  return (
    <>
      <div className="day-label">{label}</div>
      <div className="logo-wrap">
        {/* svgPath comes from our own static data/logos.ts, never from user input */}
        <svg
          width="100"
          height="100"
          viewBox={logo.viewBox}
          xmlns="http://www.w3.org/2000/svg"
          data-status={status}
          dangerouslySetInnerHTML={{ __html: logo.svgPath }}
        />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Write `GuessTiles.tsx`**

```tsx
// src/components/GuessTiles.tsx
import type { Guess } from '../lib/game-logic'

export function GuessTiles({ guesses }: { guesses: Guess[] }) {
  return (
    <div className="guesses">
      {guesses.map((g, i) => (
        <div key={i} className={'guess-tile ' + (g.correct ? 'guess-correct' : 'guess-wrong')}>
          {g.text}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors in either file.

---

### Task 8: `GuessForm` component

**Files:**
- Create: `src/components/GuessForm.tsx`

**Interfaces:**
- Consumes: `LOGOS` (Task 2), `suggestionsFor` (Task 3)
- Produces: `export function GuessForm(props: { value: string; onChange: (value: string) => void; onSubmit: (text: string) => void; logo: Logo; attemptCount: number; maxTries: number }): JSX.Element`. Consumed by Task 12.

- [ ] **Step 1: Write the component**

```tsx
// src/components/GuessForm.tsx
import { useRef } from 'react'
import { LOGOS, type Logo } from '../data/logos'
import { suggestionsFor } from '../lib/game-logic'

interface GuessFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (text: string) => void
  logo: Logo
  attemptCount: number
  maxTries: number
}

export function GuessForm({ value, onChange, onSubmit, logo, attemptCount, maxTries }: GuessFormProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestions = suggestionsFor(value, LOGOS, null)
  const hints = ['Wrong guess reveals a hint.', `Industry: ${logo.industry}`, `Founded: ${logo.founded}`]
  const hint = hints[Math.min(attemptCount, hints.length - 1)]

  return (
    <div className="play-area">
      <div className="input-wrap">
        <input
          ref={inputRef}
          type="text"
          className="guess-input"
          placeholder="TYPE A COMPANY NAME"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit(value)
          }}
        />
        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((name) => (
              <div
                key={name}
                className="suggestion"
                onClick={() => {
                  onChange(name)
                  inputRef.current?.focus()
                }}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="dots">
        {Array.from({ length: maxTries }, (_, i) => (
          <span key={i} className={'dot' + (i < attemptCount ? ' dot-used' : '')} />
        ))}
      </div>
      <div className="hint">{hint}</div>
    </div>
  )
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors in `src/components/GuessForm.tsx`.

---

### Task 9: `RevealPanel` component

**Files:**
- Create: `src/components/RevealPanel.tsx`

**Interfaces:**
- Consumes: `now` (Task 5), `nextLocalMidnight`, `formatCountdown`, `Guess` (Task 3), `Logo` (Task 2)
- Produces: `export function RevealPanel(props: { logo: Logo; guesses: Guess[]; maxTries: number; streak: number }): JSX.Element`. Consumed by Task 12.

- [ ] **Step 1: Write the component**

```tsx
// src/components/RevealPanel.tsx
import { now } from '../lib/clock'
import { nextLocalMidnight, formatCountdown, type Guess } from '../lib/game-logic'
import type { Logo } from '../data/logos'

interface RevealPanelProps {
  logo: Logo
  guesses: Guess[]
  maxTries: number
  streak: number
}

export function RevealPanel({ logo, guesses, maxTries, streak }: RevealPanelProps) {
  return (
    <div className="reveal">
      <div className="reveal-name">{logo.name}</div>
      <div className="reveal-fact">{logo.funFact}</div>
      <div className="share-grid">
        {Array.from({ length: maxTries }, (_, i) => {
          const g = guesses[i]
          const cls = g ? (g.correct ? 'share-correct' : 'share-wrong') : 'share-empty'
          return <span key={i} className={'share-cell ' + cls} />
        })}
      </div>
      <div className="meta-row">
        <span>streak {streak}</span>
        <span>next in {formatCountdown(nextLocalMidnight(now()).getTime() - now().getTime())}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors in `src/components/RevealPanel.tsx`.

---

### Task 10: `GameHeader` and `ArchivePanel` components

**Files:**
- Create: `src/components/GameHeader.tsx`
- Create: `src/components/ArchivePanel.tsx`

**Interfaces:**
- Consumes: `GameStatus` (Task 3)
- Produces: `export function GameHeader(props: { archiveOpen: boolean; onToggleArchive: () => void; dark: boolean; onToggleDark: () => void }): JSX.Element` and `export function ArchivePanel(props: { open: boolean; dayIndex: number; history: Record<string, GameStatus> }): JSX.Element`. Consumed by Task 12.

- [ ] **Step 1: Write `GameHeader.tsx`**

```tsx
// src/components/GameHeader.tsx
interface GameHeaderProps {
  archiveOpen: boolean
  onToggleArchive: () => void
  dark: boolean
  onToggleDark: () => void
}

export function GameHeader({ archiveOpen, onToggleArchive, dark, onToggleDark }: GameHeaderProps) {
  return (
    <header className="header">
      <span className="title">Guess the Logo</span>
      <div className="header-actions">
        <button type="button" className="archive-toggle" onClick={onToggleArchive}>
          <span>Past days</span>
          <span className="archive-arrow">{archiveOpen ? '▲' : '▼'}</span>
        </button>
        <button
          type="button"
          className="dark-toggle"
          data-on={String(dark)}
          aria-label="Toggle dark mode"
          onClick={onToggleDark}
        >
          <span className="dark-toggle-knob" />
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Write `ArchivePanel.tsx`**

```tsx
// src/components/ArchivePanel.tsx
import type { GameStatus } from '../lib/game-logic'

const ARCHIVE_DAYS = 5

interface ArchivePanelProps {
  open: boolean
  dayIndex: number
  history: Record<string, GameStatus>
}

export function ArchivePanel({ open, dayIndex, history }: ArchivePanelProps) {
  const rows = []
  for (let offset = 1; offset <= ARCHIVE_DAYS; offset++) {
    const idx = dayIndex - offset
    if (idx < 0) continue
    const result = history[String(idx)]
    rows.push(
      <div className="archive-day" key={idx}>
        <span
          className={
            'archive-dot ' +
            (result === 'won' ? 'archive-won' : result === 'lost' ? 'archive-lost' : 'archive-unplayed')
          }
        />
        <span>#{idx + 1}</span>
        <span className="archive-day-label">
          {result === 'won' ? 'Solved' : result === 'lost' ? 'Missed' : 'Not played'}
        </span>
      </div>,
    )
  }

  return (
    <div className="archive-panel" hidden={!open}>
      <div className="archive-days">{open ? rows : null}</div>
    </div>
  )
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors in either file.

---

### Task 11: `DevtoolsPanel` component

**Files:**
- Create: `src/components/DevtoolsPanel.tsx`

**Interfaces:**
- Consumes: `now`, `isSimulated`, `setSimulatedDate`, `nudgeDays`, `resetClock`, `subscribe` (Task 5, `src/lib/clock.ts`), `useClock` (Task 5, `src/hooks/useClock.ts`)
- Produces: `export function DevtoolsPanel(): JSX.Element`. Consumed by Task 12, rendered only when `import.meta.env.DEV`.

- [ ] **Step 1: Write the component**

```tsx
// src/components/DevtoolsPanel.tsx
import { useEffect, useState } from 'react'
import { now, isSimulated, setSimulatedDate, nudgeDays, resetClock, subscribe as subscribeClock } from '../lib/clock'
import { useClock } from '../hooks/useClock'

function formatDateInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function DevtoolsPanel() {
  useClock() // subscribes this component to clock-offset changes so it re-renders
  const [open, setOpen] = useState(false)
  const [dateInput, setDateInput] = useState(() => formatDateInput(now()))

  useEffect(() => subscribeClock(() => setDateInput(formatDateInput(now()))), [])

  function jump() {
    const [y, m, d] = dateInput.split('-').map(Number)
    if (!y || !m || !d) return
    const target = now()
    target.setFullYear(y, m - 1, d)
    setSimulatedDate(target)
  }

  return (
    <div className="devtools">
      <button
        type="button"
        className="devtools-toggle"
        aria-label="Toggle day simulator"
        onClick={() => setOpen((o) => !o)}
      >
        🛠
      </button>
      {open && (
        <div className="devtools-panel">
          <div className="devtools-row">
            {isSimulated() ? `Simulated: ${now().toDateString()}` : 'Real time'}
          </div>
          <div className="devtools-row">
            <input
              type="date"
              className="devtools-date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
            <button type="button" onClick={jump}>
              Jump
            </button>
          </div>
          <div className="devtools-row">
            <button type="button" onClick={() => nudgeDays(-1)}>
              −1 day
            </button>
            <button type="button" onClick={() => nudgeDays(1)}>
              +1 day
            </button>
            <button type="button" onClick={() => resetClock()}>
              Reset to now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors in `src/components/DevtoolsPanel.tsx`.

---

### Task 12: Wire the route together

**Files:**
- Modify: `src/routes/index.tsx` (replace the Task 1 placeholder)

**Interfaces:**
- Consumes: `useGameState` (Task 6); `GameHeader`, `ArchivePanel` (Task 10); `LogoCard`, `GuessTiles` (Task 7); `GuessForm` (Task 8); `RevealPanel` (Task 9); `DevtoolsPanel` (Task 11)
- Produces: the complete, functional game page.

- [ ] **Step 1: Replace `src/routes/index.tsx`**

```tsx
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useGameState } from '../hooks/useGameState'
import { GameHeader } from '../components/GameHeader'
import { ArchivePanel } from '../components/ArchivePanel'
import { LogoCard } from '../components/LogoCard'
import { GuessTiles } from '../components/GuessTiles'
import { GuessForm } from '../components/GuessForm'
import { RevealPanel } from '../components/RevealPanel'
import { DevtoolsPanel } from '../components/DevtoolsPanel'

export const Route = createFileRoute('/')({
  ssr: false,
  component: Home,
})

function Home() {
  const g = useGameState()
  const isPlaying = g.status === 'playing'

  return (
    <div className="page">
      <GameHeader
        archiveOpen={g.archiveOpen}
        onToggleArchive={g.toggleArchive}
        dark={g.dark}
        onToggleDark={g.toggleDark}
      />
      <ArchivePanel open={g.archiveOpen} dayIndex={g.dayIndex} history={g.history} />
      <main className="game-area">
        <div className="card">
          <LogoCard dayIndex={g.dayIndex} status={g.status} logo={g.logo} />
          <GuessTiles guesses={g.guesses} />
          {isPlaying && (
            <GuessForm
              value={g.value}
              onChange={g.setValue}
              onSubmit={g.submitGuess}
              logo={g.logo}
              attemptCount={g.guesses.length}
              maxTries={g.maxTries}
            />
          )}
          {!isPlaying && (
            <RevealPanel logo={g.logo} guesses={g.guesses} maxTries={g.maxTries} streak={g.streak} />
          )}
        </div>
      </main>
      {import.meta.env.DEV && <DevtoolsPanel />}
    </div>
  )
}
```

- [ ] **Step 2: Verify the full build**

Run: `npm run build`
Expected: build succeeds with no TypeScript or bundler errors.

- [ ] **Step 3: Verify types across the whole project**

Run: `npx tsc --noEmit`
Expected: zero errors.

---

### Task 13: Remove legacy Astro files and update `CLAUDE.md`

**Files:**
- Delete: `astro.config.mjs`
- Delete: `src/pages/index.astro`
- Delete: `src/pages/` (now empty)
- Delete: `src/scripts/game.js`
- Delete: `src/scripts/clock.js`
- Delete: `src/scripts/devtools.js`
- Delete: `src/scripts/` (now empty)
- Delete: `src/data/logos.js`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: nothing (cleanup task, run only after Task 12's build passes)
- Produces: a tree with no remaining Astro-era files.

- [ ] **Step 1: Delete the old Astro entry point and config**

Run:
```bash
rm astro.config.mjs
rm src/pages/index.astro
rmdir src/pages
```

- [ ] **Step 2: Delete the old vanilla-JS scripts and data file**

These are fully superseded by `src/lib/game-logic.ts`, `src/lib/clock.ts`, `src/hooks/useGameState.ts`, `src/components/DevtoolsPanel.tsx`, and `src/data/logos.ts`.

```bash
rm src/scripts/game.js
rm src/scripts/clock.js
rm src/scripts/devtools.js
rmdir src/scripts
rm src/data/logos.js
```

- [ ] **Step 3: Update `CLAUDE.md`'s Development section**

Replace:
```markdown
## Development

When starting the dev server, use background mode:

​```
astro dev --background
​```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.
```

With:
```markdown
## Development

Start the dev server with:

​```
npm run dev
​```

Build for production with `npm run build`, preview a production build with `npm run start`.
```

Also remove or update the "Documentation" section's Astro doc links, since the project no longer uses Astro — replace with a link to TanStack Start's docs (https://tanstack.com/start) if a documentation-links section is kept, or delete the section entirely if it no longer applies.

- [ ] **Step 4: Verify the build still succeeds after cleanup**

Run: `npm run build`
Expected: build succeeds — confirms nothing deleted was still referenced.

---

### Task 14: Manual verification (performed by the user, not this agent)

**Files:** none — this task is a checklist, not code changes.

This task is intentionally not executed by the implementing agent. Once Task 13 passes, report completion and hand the checklist below to the user to run themselves:

- [ ] Run `npm run dev` and open the app in a browser.
- [ ] Confirm the page loads with the same layout/styling as before (header, card, logo, guess input).
- [ ] Type a wrong guess and submit with Enter — confirm a hint appears and a guess tile shows red.
- [ ] Type the correct answer — confirm the reveal panel shows (name, fun fact, share grid, streak, countdown).
- [ ] Reload the page mid-game — confirm guesses/status are restored from `localStorage`.
- [ ] Toggle dark mode — confirm the theme switches and persists across a reload with no flash of the wrong theme on load.
- [ ] Open "Past days" — confirm the archive panel lists previous days with correct solved/missed/not-played state.
- [ ] Open the devtools panel (🛠, dev-only) — jump to a future date, confirm the game reloads with a new logo/day number and the countdown/streak update; use −1/+1 day and "Reset to now"; confirm the devtools panel and its trigger button are absent from a production build (`npm run build && npm run start`, verify no 🛠 button).

---

## Self-Review Notes

- **Spec coverage:** client-only rendering (Task 1/12 `ssr: false`), TypeScript throughout (Tasks 1–12), devtools carried forward and dev-gated (Tasks 5, 11, 12), CSS ported unchanged (Task 1 imports the existing file at its existing path, never edited), no test runner introduced (throwaway `tsx` scripts only, deleted immediately), no commits (stated in Global Constraints, no commit steps in any task), CLAUDE.md dev-workflow update (Task 13) — all spec sections have a corresponding task.
- **Type consistency checked:** `Logo` (Task 2) → used identically in Tasks 3, 6, 7, 8, 9, 10, 12. `Guess`/`GameStatus` (Task 3) → used identically in Tasks 6, 7, 9, 10, 12. `useGameState()`'s returned field names (Task 6) match exactly what Task 12 destructures (`g.dayIndex`, `g.logo`, `g.guesses`, `g.status`, `g.value`, `g.setValue`, `g.submitGuess`, `g.archiveOpen`, `g.toggleArchive`, `g.dark`, `g.toggleDark`, `g.history`, `g.streak`, `g.maxTries`).
- **Ordering:** cleanup (Task 13) is deliberately last, after Task 12's build passes, so the old Astro/JS files remain available as a reference throughout the port and are only removed once proven unnecessary.
