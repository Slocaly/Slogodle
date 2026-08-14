# Playable Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "Past days" archive panel interactive so any visitor can open and play (or, if already finished, review) any of the last 5 days, with a clear way back to today.

**Architecture:** Replace the two existing localStorage records (`logodle_today_v1` single-slot, `logodle_history_v1` status-only) with one combined per-day record (`logodle_days_v1`) covering every day ever attempted. `useGameState` tracks a real `todayIndex` plus a separately-selectable `activeDayIndex`/`pinnedToToday`, so "today" becomes just the default case of "whichever day is on screen." The archive panel's rows become buttons that call into the hook to switch the active day; the main card, reveal panel, and background logo pile all already read from "the active day" once the hook is updated, so they work for past days automatically.

**Tech Stack:** React 19, TanStack Start/Router, plain CSS, `localStorage` for persistence. No test framework exists in this repo (`package.json` has no test script/runner) — see Global Constraints.

Full design reference: `docs/superpowers/specs/2026-08-14-playable-archive-design.md`

## Global Constraints

- No automated test suite exists in this project (confirmed via `package.json`: no `test` script, no test runner dependency). Every task ends in a **Manual verification** step (steps to run `pnpm run dev` and check specific behavior in the browser) instead of an automated test run. There is no "write failing test first" step in this plan for that reason.
- Do not run `git add`/`git commit` as part of executing this plan — the user commits their own work in this project. Skip the "Commit" step type from the standard task template entirely.
- Do not run `tsc`/`pnpm run build` or start the dev server proactively to "self-check" — describe the change and let the user test it, per this project's established working style. (If you are executing this plan autonomously and need to confirm something compiles, prefer reading the code back over running build tooling.)
- Keep the existing `LOGOS`/`data/logos.ts`, `lib/game-logic.ts`, `lib/clock.ts`, `lib/storage.ts` modules unchanged — this feature is additive on top of them, no changes needed there.
- Preserve existing localStorage keys `logodle_today_v1` and `logodle_history_v1` on disk (read for one-time migration, never written again) — do not delete them.

---

### Task 1: Per-day state model in `useGameState`

**Files:**
- Modify: `src/hooks/useGameState.ts` (full rewrite)

**Interfaces:**
- Consumes: `LOGOS`/`Logo` from `../data/logos`; `loadJSON`/`saveJSON` from `../lib/storage`; `now`/`subscribe` from `../lib/clock`; `dayIndexFor`, `pickLogo`, `isCorrectGuess`, `computeStreak`, `Guess`, `GameStatus` from `../lib/game-logic` — all unchanged, existing exports.
- Produces (the hook's returned object, consumed by `src/routes/index.tsx` in later tasks):
  - `dayIndex: number` — the currently *active/displayed* day (today by default). Same field name as before, so no other file needs to change in this task.
  - `todayIndex: number` — the real current day, independent of what's displayed. **New.**
  - `isToday: boolean` — `dayIndex === todayIndex`. **New.**
  - `logo: Logo`, `guesses: Guess[]`, `status: GameStatus` — now describe the *active* day, not necessarily today. Same field names as before.
  - `value: string`, `setValue: (v: string) => void`, `submitGuess: (text: string) => void` — unchanged signatures; `submitGuess` now writes to the active day.
  - `viewDay: (dayIndex: number) => void` — **New.** Switches the active day, unpins from today, closes the archive panel, clears `value`.
  - `returnToToday: () => void` — **New.** Re-pins to today, clears `value`.
  - `archiveOpen: boolean`, `toggleArchive: () => void` — unchanged.
  - `dark: boolean`, `toggleDark: () => void` — unchanged.
  - `history: Record<string, GameStatus>` — unchanged shape, now derived from the new combined day records.
  - `streak: number` — unchanged meaning, still computed from `todayIndex` (never from whatever day is being viewed).
  - `maxTries: number` — unchanged.

- [ ] **Step 1: Rewrite `src/hooks/useGameState.ts`**

Replace the entire file with:

```ts
import { useEffect, useState } from 'react'
import { LOGOS, type Logo } from '../data/logos'
import { loadJSON, saveJSON } from '../lib/storage'
import { now, subscribe as subscribeClock } from '../lib/clock'
import { dayIndexFor, pickLogo, isCorrectGuess, computeStreak, type Guess, type GameStatus } from '../lib/game-logic'

const MAX_TRIES = 3
const OLD_TODAY_KEY = 'logodle_today_v1'
const OLD_HISTORY_KEY = 'logodle_history_v1'
const DAYS_KEY = 'logodle_days_v1'
const DARK_KEY = 'logodle_dark_v1'

interface DayRecord {
  guesses: Guess[]
  status: GameStatus
}

type DaysRecord = Record<string, DayRecord>

interface OldSavedToday {
  dayIndex: number
  guesses: Guess[]
  status: GameStatus
}

const EMPTY_DAY: DayRecord = { guesses: [], status: 'playing' }

// One-time migration from the old two-key storage format (today-only slot +
// status-only history) into a single per-day record. Runs at most once per
// browser: after it saves DAYS_KEY, `loadJSON(DAYS_KEY, null)` will return a
// non-null value (even `{}` for a fresh install) so this body never runs again.
function loadDays(): DaysRecord {
  const existing = loadJSON<DaysRecord | null>(DAYS_KEY, null)
  if (existing) return existing

  const migrated: DaysRecord = {}
  const oldHistory = loadJSON<Record<string, GameStatus>>(OLD_HISTORY_KEY, {})
  for (const [key, status] of Object.entries(oldHistory)) {
    migrated[key] = { guesses: [], status }
  }
  const oldToday = loadJSON<OldSavedToday | null>(OLD_TODAY_KEY, null)
  if (oldToday) {
    migrated[String(oldToday.dayIndex)] = { guesses: oldToday.guesses, status: oldToday.status }
  }
  saveJSON(DAYS_KEY, migrated)
  return migrated
}

export function useGameState() {
  const [todayIndex, setTodayIndex] = useState(() => dayIndexFor(now()))
  const [activeDayIndex, setActiveDayIndex] = useState(() => dayIndexFor(now()))
  const [pinnedToToday, setPinnedToToday] = useState(true)
  const [days, setDays] = useState<DaysRecord>(loadDays)
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

  const logo = pickLogo(LOGOS, activeDayIndex)
  const dayRecord = days[String(activeDayIndex)] ?? EMPTY_DAY
  const isToday = activeDayIndex === todayIndex

  // Persist per-day state whenever it changes.
  useEffect(() => {
    saveJSON(DAYS_KEY, days)
  }, [days])

  // Persist dark-mode preference and reflect it on <html data-theme>.
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    try {
      localStorage.setItem(DARK_KEY, dark ? '1' : '0')
    } catch (e) {
      // best-effort, matches current behavior
    }
  }, [dark])

  // Tick every second; if the real day has rolled over and we're pinned to
  // today, follow it. If the user has navigated to a past day (unpinned),
  // leave them there through a rollover.
  useEffect(() => {
    const id = setInterval(() => {
      const freshTodayIndex = dayIndexFor(now())
      if (freshTodayIndex !== todayIndex) {
        setTodayIndex(freshTodayIndex)
        if (pinnedToToday) {
          setActiveDayIndex(freshTodayIndex)
          setValue('')
        }
      } else {
        forceTick((t) => t + 1)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [todayIndex, pinnedToToday])

  // React to devtools clock changes immediately, not just on the next 1s tick.
  useEffect(
    () =>
      subscribeClock(() => {
        const freshTodayIndex = dayIndexFor(now())
        setTodayIndex(freshTodayIndex)
        if (pinnedToToday) {
          setActiveDayIndex(freshTodayIndex)
          setValue('')
        }
      }),
    [pinnedToToday],
  )

  const history: Record<string, GameStatus> = {}
  for (const [key, record] of Object.entries(days)) {
    history[key] = record.status
  }
  const streak = computeStreak(history, todayIndex)

  function submitGuess(text: string) {
    if (dayRecord.status !== 'playing' || !text.trim()) return
    const correct = isCorrectGuess(text, logo)
    const guesses = [...dayRecord.guesses, { text: text.trim(), correct }]
    const status: GameStatus = correct ? 'won' : guesses.length >= MAX_TRIES ? 'lost' : 'playing'
    setDays((prev) => ({ ...prev, [String(activeDayIndex)]: { guesses, status } }))
    setValue('')
  }

  function viewDay(dayIndex: number) {
    setPinnedToToday(false)
    setActiveDayIndex(dayIndex)
    setValue('')
    setArchiveOpen(false)
  }

  function returnToToday() {
    setPinnedToToday(true)
    setActiveDayIndex(todayIndex)
    setValue('')
  }

  return {
    dayIndex: activeDayIndex,
    todayIndex,
    isToday,
    logo,
    guesses: dayRecord.guesses,
    status: dayRecord.status,
    value,
    setValue,
    submitGuess,
    viewDay,
    returnToToday,
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

- [ ] **Step 2: Manual verification**

Since this task only touches the hook and every field it returns to `dayIndex`, `logo`, `guesses`, `status`, `history`, `streak`, `maxTries` keeps the same name and meaning as before for "today," the app should behave *exactly* as it did before this task when you don't touch the (still non-interactive) archive panel. Run `pnpm run dev` and check:

1. Load the page: today's puzzle appears as before.
2. Submit a guess: it resolves (correct/wrong) exactly as before.
3. Refresh mid-guess: your in-progress guesses reappear (resume-from-reload still works).
4. Open browser devtools → Application → Local Storage: confirm a new `logodle_days_v1` key exists containing today's entry (and any prior history folded in). The old `logodle_today_v1` / `logodle_history_v1` keys are still present but no longer change after this point — that's expected (migration is one-way).
5. Solve or miss the puzzle: confirm the reveal panel, streak, and countdown still behave as before.
6. If you have a browser profile with pre-existing play history from before this change (old keys only, no `logodle_days_v1` yet), load the page once and confirm the streak number shown matches what it was before — this exercises the migration path.

---

### Task 2: Clickable, playable archive rows

**Files:**
- Modify: `src/components/ArchivePanel.tsx` (full rewrite)
- Modify: `src/routes/index.tsx:32` (the `<ArchivePanel ... />` call)
- Modify: `src/styles/global.css` (archive row styling)

**Interfaces:**
- Consumes: `g.todayIndex`, `g.dayIndex`, `g.history`, `g.viewDay`, `g.archiveOpen` from Task 1's `useGameState`; `pickLogo` from `../lib/game-logic`; `LOGOS` from `../data/logos`.
- Produces: `ArchivePanel` now requires an `activeDayIndex: number` prop (for highlighting the selected row) and an `onSelectDay: (dayIndex: number) => void` prop (called on row click), in addition to its existing `open`, `dayIndex`, `history` props. Its `dayIndex` prop must now be the *real* today (`g.todayIndex`), not whatever day is active, so the list of "last 5 days" stays anchored to real time even while browsing an old day.

- [ ] **Step 1: Rewrite `src/components/ArchivePanel.tsx`**

```tsx
import { LOGOS } from '../data/logos'
import { pickLogo, type GameStatus } from '../lib/game-logic'

const ARCHIVE_DAYS = 5

interface ArchivePanelProps {
  open: boolean
  dayIndex: number
  activeDayIndex: number
  history: Record<string, GameStatus>
  onSelectDay: (dayIndex: number) => void
}

export function ArchivePanel({ open, dayIndex, activeDayIndex, history, onSelectDay }: ArchivePanelProps) {
  const rows = []
  for (let offset = 1; offset <= ARCHIVE_DAYS; offset++) {
    const idx = dayIndex - offset
    if (idx < 0) continue
    const result = history[String(idx)]
    const statusClass = result === 'won' ? 'archive-won' : result === 'lost' ? 'archive-lost' : 'archive-unplayed'
    const name = result === 'won' || result === 'lost' ? pickLogo(LOGOS, idx).name : null
    rows.push(
      <button
        type="button"
        className={'archive-day' + (idx === activeDayIndex ? ' archive-day-active' : '')}
        key={idx}
        onClick={() => onSelectDay(idx)}
      >
        <span className={'archive-dot ' + statusClass} />
        <span>#{idx + 1}</span>
        {name && <span className="archive-day-label">{name}</span>}
      </button>,
    )
  }

  return (
    <div className="archive-panel" hidden={!open}>
      <div className="archive-days">{open ? rows : null}</div>
    </div>
  )
}
```

Note: the old "Solved"/"Missed"/"Not played" text is gone — the dot color (`archive-won`/`archive-lost`/`archive-unplayed`, unchanged classes) is the only status indicator now, per your request.

- [ ] **Step 2: Wire the new props in `src/routes/index.tsx`**

Find this block (around line 32):

```tsx
        <ArchivePanel open={g.archiveOpen} dayIndex={g.dayIndex} history={g.history} />
```

Replace it with:

```tsx
        <ArchivePanel
          open={g.archiveOpen}
          dayIndex={g.todayIndex}
          activeDayIndex={g.dayIndex}
          history={g.history}
          onSelectDay={g.viewDay}
        />
```

- [ ] **Step 3: Style the rows as buttons in `src/styles/global.css`**

Find the existing `.archive-day` rule:

```css
.archive-day {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted);
}
```

Replace it with (adds button reset + hover/active affordance, keeps the same layout):

```css
.archive-day {
  display: flex;
  align-items: center;
  gap: 8px;
  font: inherit;
  background: none;
  border: none;
  padding: 4px 6px;
  border-radius: 10px;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.archive-day:hover {
  background: var(--toggle-bg);
  color: var(--text);
}

.archive-day-active {
  background: var(--accent-lavender);
  color: var(--text);
}
```

`.archive-day-label` (used here for the logo name) and `.archive-dot`/`.archive-won`/`.archive-lost`/`.archive-unplayed` are unchanged — leave those rules as they are.

- [ ] **Step 4: Manual verification**

Run `pnpm run dev` and check:

1. Open "Past days": rows now show a colored dot + day number, with a logo name next to Solved/Missed rows and no name next to Not-played rows — no "Solved"/"Missed"/"Not played" text anywhere.
2. Click an unplayed past day: the archive panel closes and the main card now shows that day's logo with a live guess form (different logo than today's, since it's a different day index). Submit guesses — they resolve normally.
3. Reload the page while mid-guess on that past day: confirm it resumes showing your in-progress guesses for that day (not today's).
4. Go back to "Past days" and click that same day again: confirm it now shows as Solved or Missed (dot color) with the logo's name in the row, and the highlighted/active styling on whichever row matches the currently-displayed day.
5. Click a day that was already Solved/Missed (from before this change, if you have old history) and confirm its row is clickable and doesn't error even though it has no stored guesses yet (recap/guess-tiles will just look sparse — Task 3 refines the recap view).
6. Confirm the "Past days" list itself always shows the same 5 real-world days regardless of which day is currently displayed in the main card (i.e., it doesn't shift when you're viewing an old day).

---

### Task 3: "Back to today" control and past-day recap

**Files:**
- Modify: `src/components/LogoCard.tsx`
- Modify: `src/components/RevealPanel.tsx`
- Modify: `src/routes/index.tsx:34-49` (the `<LogoCard>` and `<RevealPanel>` calls)
- Modify: `src/styles/global.css` (new `.day-label-row` / `.back-today-btn` styles)

**Interfaces:**
- Consumes: `g.isToday`, `g.returnToToday` from Task 1's `useGameState`.
- Produces: `LogoCard` now requires `isToday: boolean` and `onBackToday: () => void` props. `RevealPanel` now requires `isToday: boolean` and `onBackToday: () => void` props (in addition to its existing `logo`, `guesses`, `maxTries`, `streak` props).

- [ ] **Step 1: Add the back-to-today control to `src/components/LogoCard.tsx`**

Replace the full file with:

```tsx
// src/components/LogoCard.tsx
import type { Logo } from '../data/logos'
import type { GameStatus } from '../lib/game-logic'

interface LogoCardProps {
  dayIndex: number
  status: GameStatus
  logo: Logo
  isToday: boolean
  onBackToday: () => void
}

export function LogoCard({ dayIndex, status, logo, isToday, onBackToday }: LogoCardProps) {
  const label =
    status === 'playing'
      ? `GUESS THE LOGO · #${dayIndex + 1}`
      : status === 'won'
        ? `SOLVED — #${dayIndex + 1}`
        : `MISSED — #${dayIndex + 1}`

  return (
    <>
      <div className="day-label-row">
        <div className="day-label">{label}</div>
        {!isToday && (
          <button type="button" className="back-today-btn" onClick={onBackToday}>
            ← Back to today
          </button>
        )}
      </div>
      <div className="logo-wrap">
        {/* svgPath comes from our own static data/logos.ts, never from user input */}
        <svg
          id="logo-svg"
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

- [ ] **Step 2: Make the recap drop streak/countdown for past days in `src/components/RevealPanel.tsx`**

Replace the full file with:

```tsx
import { now } from '../lib/clock'
import { nextLocalMidnight, formatCountdown, type Guess } from '../lib/game-logic'
import type { Logo } from '../data/logos'

interface RevealPanelProps {
  logo: Logo
  guesses: Guess[]
  maxTries: number
  streak: number
  isToday: boolean
  onBackToday: () => void
}

export function RevealPanel({ logo, guesses, maxTries, streak, isToday, onBackToday }: RevealPanelProps) {
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
      {isToday ? (
        <div className="meta-row">
          <span>streak {streak}</span>
          <span>next in {formatCountdown(nextLocalMidnight(now()).getTime() - now().getTime())}</span>
        </div>
      ) : (
        <div className="meta-row">
          <button type="button" className="back-today-btn" onClick={onBackToday}>
            ← Back to today
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Pass the new props in `src/routes/index.tsx`**

Find:

```tsx
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
```

Replace with:

```tsx
            <LogoCard
              dayIndex={g.dayIndex}
              status={g.status}
              logo={g.logo}
              isToday={g.isToday}
              onBackToday={g.returnToToday}
            />
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
              <RevealPanel
                logo={g.logo}
                guesses={g.guesses}
                maxTries={g.maxTries}
                streak={g.streak}
                isToday={g.isToday}
                onBackToday={g.returnToToday}
              />
            )}
```

- [ ] **Step 4: Add `.day-label-row` and `.back-today-btn` styles in `src/styles/global.css`**

Find the existing `.day-label` rule:

```css
.day-label {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--text);
  background: var(--accent-yellow);
  padding: 6px 16px;
  border-radius: 999px;
  margin-bottom: 32px;
}
```

Replace it with (moves the bottom margin onto a new wrapping row, adds the back-to-today button style):

```css
.day-label-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 32px;
}

.day-label {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--text);
  background: var(--accent-yellow);
  padding: 6px 16px;
  border-radius: 999px;
}

.back-today-btn {
  font: inherit;
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.15s;
}

.back-today-btn:hover {
  color: var(--accent-pink);
}
```

- [ ] **Step 5: Manual verification**

Run `pnpm run dev` and check:

1. Today's card: no "← Back to today" button appears (you're already on today), streak + countdown still show in the reveal panel exactly as before.
2. Click an unplayed past day from the archive: the "← Back to today" button now appears next to the day label immediately (even before you've finished guessing), and clicking it returns you to today's puzzle in whatever state you'd left it.
3. Finish a past day (win or lose): the recap shows the logo name, fun fact, and guess strip, but *no* streak/countdown — instead a "← Back to today" button in their place. Click it, confirm you're back on today.
4. Confirm the streak number only changes when it should: today's own outcome always affects it; winning a past unplayed day can increase it if that day is immediately adjacent to the existing streak chain (accepted behavior — see design doc), but merely browsing past days (without completing anything) never changes it.
5. Resize the window narrow (mobile width) and confirm the day label + back button wrap sensibly instead of overflowing the card.
6. Switch between today and a past day a couple of times: confirm the falling background logo pile's composition changes to match whichever day is on screen, and never includes that day's own answer (no spoilers). This works automatically from Task 1's changes (`PhysicsLogoPile` already receives `g.dayIndex`/`g.logo.name`, which now track the active day) — this step is just confirming it, no new code.
