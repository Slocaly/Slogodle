# Playable Archive — Design

## Summary

Turn the read-only "Past days" archive panel into a real, per-visitor
mechanism for playing past puzzles. Today, the panel only shows a status
dot for the last 5 days (Solved/Missed/Not played); the only way to
actually play an earlier day is the dev-only Devtools time-travel clock.
This change makes past days clickable and playable for everyone, with no
`import.meta.env.DEV` gating.

## Goals

- Any visitor can open any of the last 5 past days from the archive panel.
- An unplayed past day is fully playable (same guess flow as today).
- An already-solved/missed past day shows a read-only recap instead of
  being replayable (the outcome is locked in).
- The main game card can show either today's puzzle or a past day's
  puzzle, with a clear way back to today.
- Archive rows communicate status via color only (existing dot classes),
  not text labels — and show the logo's name for solved/missed days.

## Non-goals

- No change to which days appear in the archive (stays the last 5, same
  as today's `ARCHIVE_DAYS` constant).
- No replay of already-completed days — recap is read-only.
- No backend/server sync — everything stays in `localStorage`, per browser,
  same as today.
- No change to the dev-only clock simulator itself.

## Data model

Replace the two existing storage records:

- `TODAY_KEY` (`logodle_today_v1`) — single slot, only today's guesses.
- `HISTORY_KEY` (`logodle_history_v1`) — `Record<dayIndex, GameStatus>`,
  status only, no guesses.

...with one combined record:

```ts
const DAYS_KEY = 'logodle_days_v1'
type DaysRecord = Record<string /* dayIndex */, { guesses: Guess[]; status: GameStatus }>
```

This covers every day ever attempted, today included, so a completed past
day's guesses are available for its recap, and an in-progress past day
survives a reload.

**Migration:** on first load, if `DAYS_KEY` is absent but the old keys are
present, build it once: seed from `HISTORY_KEY` (status only, `guesses: []`
for each entry), then overlay `TODAY_KEY` if present (full detail, since it
has real guesses). Write the result to `DAYS_KEY`. The old keys are left
alone (unused going forward, but not deleted) so this is safe to run
speculatively. Fresh installs with neither old key just start with `{}`.

## State model (`useGameState`)

- `todayIndex`: the real day index from `dayIndexFor(now())`, recomputed
  every clock tick / clock-subscribe event, same as today.
- `activeDayIndex`: which day's puzzle is currently shown. Defaults to
  `todayIndex`.
- `pinnedToToday`: boolean, starts `true`. While `true`, `activeDayIndex`
  tracks `todayIndex` automatically (so a real midnight rollover, or a
  devtools clock jump, still advances the visible puzzle exactly like
  today). Selecting a past day sets `pinnedToToday = false` and
  `activeDayIndex = <chosen day>`. `returnToToday()` sets `pinnedToToday =
  true` and snaps `activeDayIndex` back to `todayIndex` immediately.
- `logo = pickLogo(LOGOS, activeDayIndex)` — deterministic, so it works
  identically for today or any past day, no data fetch needed.
- `dayRecord = days[activeDayIndex] ?? { guesses: [], status: 'playing' }`
  — guesses/status shown and mutated always come from this, replacing the
  old separate "today" reducer slot.
- `submitGuess` always writes into `days[activeDayIndex]`. This applies
  uniformly whether `activeDayIndex` is today or an unplayed past day —
  there is no separate code path.
- Whenever `days[activeDayIndex]` changes, persist the whole `days` record
  to `DAYS_KEY`.
- `history` (`Record<dayIndex, GameStatus>`, used by `computeStreak` and
  the archive panel) is derived from `days` by mapping each entry to its
  `.status`.
- **Streak stays keyed off `todayIndex`, never `activeDayIndex`.** Browsing
  or completing a past puzzle must not change what streak number is
  displayed — `computeStreak(history, todayIndex)` is called exactly as
  today, using the always-current `today` history entry, not whatever day
  is being viewed.
- Value (the guess-input text) resets to `''` whenever `activeDayIndex`
  changes (selecting a new day or returning to today), matching the
  existing reset-on-rollover behavior.

## UI changes

### `ArchivePanel`

- Each row becomes a `<button>` (was a plain `<div>`), clickable for every
  status including "not played".
- Row content, by status:
  - **Solved / Missed:** colored dot (existing `archive-won` /
    `archive-lost` classes) + `#<day number>` + the logo's name (via
    `pickLogo(LOGOS, idx).name` — always available, no dependency on
    stored guesses). No "Solved"/"Missed" text label; the dot color alone
    conveys it.
  - **Not played:** colored dot (existing `archive-unplayed` class) +
    `#<day number>`. No name (would spoil an unplayed puzzle), no text
    label.
- The row for the currently active day (`idx === activeDayIndex`) gets a
  highlighted/selected visual state (new modifier class, e.g.
  `archive-day-active`).
- Clicking a row calls a new `onSelectDay(idx)` prop, then the panel
  auto-closes (same effect as clicking the archive toggle again) so the
  main card is immediately visible.

### Main card / `routes/index.tsx`

- `LogoCard`, `GuessTiles`, `GuessForm`, `RevealPanel` all key off
  `activeDayIndex` / the active day's `logo`/`guesses`/`status` instead of
  "today's" — `isPlaying = status === 'playing'` continues to decide
  between showing `GuessForm` or `RevealPanel`, now correct for both today
  and an unplayed past day.
- A small "← Back to today" control appears above the card whenever
  `activeDayIndex !== todayIndex`, calling `returnToToday()`. Placed next
  to the existing day label in `LogoCard`'s header area.
- `PhysicsLogoPile` receives `dayIndex={activeDayIndex}` and
  `excludeName={logo.name}` (the active day's logo) instead of today's —
  the falling background re-seeds to match whichever puzzle is on screen,
  and keeps excluding that puzzle's answer so it never spoils it.

### `RevealPanel`

- Gains an `isToday: boolean` prop.
- When `isToday` (finishing today's puzzle, the existing behavior):
  unchanged — shows `streak` and `next in <countdown>`.
- When viewing a past day's recap (`isToday === false`): the streak and
  countdown are dropped (both are meaningless off-today) and replaced with
  the same "← Back to today" action described above.
- Everything else (logo name, fun fact, guess-result strip) is unchanged
  and already works for past days once `guesses` comes from the stored
  `dayRecord`.
- **Known gap:** history entries created before this change only have a
  status, no stored guesses (old `HISTORY_KEY` had no guess detail). Their
  recap will show an empty guess-result strip (all `share-empty` cells)
  rather than fabricated data. Anything played from this point forward has
  full detail. This is accepted as-is — no backfill attempted.

## Edge cases

- Archive never lists a day beyond `activeDayIndex - 1` at most (loop
  starts at `offset = 1`), so future days are never reachable through this
  UI — existing devtools-only future-jumping is unaffected and separate.
- If a user is viewing a past day and the real day rolls over at midnight,
  nothing changes for them (`pinnedToToday` is `false`); if they're
  pinned to today when it rolls over, they advance exactly as before.
- Winning a previously-unplayed past day that is immediately adjacent to
  the current streak chain (i.e., filling a gap directly behind today
  with no loss in between) *does* extend the displayed streak, since
  `computeStreak` walks backward from today counting consecutive wins and
  cannot distinguish a live win from a backfilled one. This is accepted
  as correct — the user genuinely won that day. It can only ever grow the
  streak, never shrink it, since streak computation still stops at the
  first non-`'won'` day.

## Testing plan

Manual verification only (per project convention — no automated test
suite exists):

- Open the archive, click an unplayed past day: confirm the guess form
  appears for that day's (different) logo, guesses submit and resolve
  normally, and reloading the page mid-attempt resumes it.
- Solve a past day, confirm it now shows in the archive as "Solved" (dot
  color) with the correct logo name, and re-clicking it shows the
  read-only recap with the guesses just made.
- Miss a past day (3 wrong guesses), confirm same as above for "Missed".
- From a past-day recap, click "← Back to today": confirm today's puzzle
  (in whatever state it was left in) reappears, streak/countdown restored.
- Confirm the streak number shown never changes as a result of
  playing/browsing past days, only as a result of today's outcome.
- Confirm the background logo pile changes to exclude whichever puzzle is
  currently on screen when switching days.
- Refresh with `localStorage` from before this change present (old
  `logodle_today_v1` / `logodle_history_v1` keys only): confirm existing
  streak/history still shows correctly after migration.
