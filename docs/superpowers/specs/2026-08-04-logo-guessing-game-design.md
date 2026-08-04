# Guess the Logo — Design

## Summary

A Wordle-style daily game: a company logo is shown in silhouette (single color), and
the player has 3 guesses to name the company. Wrong guesses reveal progressive hints
(industry, then founding year). The puzzle rotates daily from a curated bank of
company logos. Ported from a Claude Design mockup (`Logo Guessing Game.dc.html` /
`support.js` in the linked design project) into a real Astro implementation — the
mockup's `x-dc`/`support.js` runtime is a design-tool preview format only and is not
part of the shipped app; its markup and embedded game logic (`Component` class in the
`<script type="text/x-dc" data-dc-script>` block) are the reference for behavior, not
code to reuse directly.

## Scope decisions

- **Puzzle rotation:** multi-logo bank with date-based rotation, not a single fixed
  puzzle. Simple modulo repeat once the bank is exhausted (no shuffle/seed) — accepted
  tradeoff that the day-to-day sequence repeats identically every full cycle through
  the bank.
- **Tech stack:** vanilla JS island (a single client-side script module), no new
  framework dependency (`@astrojs/react` etc. not added).
- **Logo assets:** curated inline single-color SVG path data for ~15-20 well-known
  brands, written by hand in the same style as the mockup's Vue.js example, stored
  alongside each answer's metadata.
- **Archive:** read-only status strip only (no click-through to replay past days).
- **Share:** visual-only colored grid after game end, no clipboard/copy action wired
  up (may be added later).
- **Testing:** manual verification via the dev server (golden path + edge cases in a
  browser). No automated test runner is introduced for this single-page game.
- **Out of scope for this pass:** replayable archive, real share/copy feature, seeded
  shuffle rotation, backend/server-side persistence (everything is localStorage-only,
  single browser/device).

## Architecture & file layout

Single Astro page holds static markup; one client-side module handles all
interactivity.

- `src/pages/index.astro` — page shell: header (title, "Past days" toggle, dark-mode
  toggle), archive strip container, game card container. Loads `global.css` and the
  game script as a module.
- `src/data/logos.js` — the logo bank: an array of entries, each
  `{ name, aliases, industry, founded, funFact, svgPath, viewBox, color }`.
  - `name`: display name (e.g. `"Vue.js"`).
  - `aliases`: lowercase strings accepted as a correct guess (e.g.
    `["vue", "vue.js", "vuejs"]`).
  - `industry`, `founded`, `funFact`: used for progressive hints and the post-game
    reveal.
  - `svgPath`, `viewBox`, `color`: single-color logo mark, rendered at a fixed size.
- `src/scripts/game.js` — game state, rendering, persistence, timers. Single entry
  point that queries the page's DOM containers and wires up all behavior on load.
- `src/styles/global.css` — CSS custom properties for light/dark theme, layout, and
  the three keyframe animations (`revealPop`, `revealFade`, `revealTile`) carried over
  from the mockup.

No component-splitting beyond this: it's one self-contained game view with no reuse
case yet, so extra files would add indirection without benefit.

## Day rotation

- Epoch constant: `2024-01-01` (local time) = day index `0`.
- `dayIndex = floor((todayLocalMidnight - epochLocalMidnight) / 86_400_000)`.
- Displayed puzzle number: `dayIndex + 1` (matches mockup's `#214`-style label).
- Today's logo: `bank[dayIndex % bank.length]`.

## Game state & rendering

State shape (in-memory, rebuilt from localStorage on load):

```
{
  value: string,            // current input text
  guesses: { text: string, correct: boolean }[],
  status: "playing" | "won" | "lost",
  archiveOpen: boolean,
  dark: boolean,
}
```

A single `render(state)` function rebuilds the dynamic DOM regions (input, guesses
list, suggestion dropdown, hint text, progress dots, end-of-game reveal block) based
on `status`. Called after every state mutation. This mirrors the mockup's
`state` + `renderVals()` shape without introducing a framework.

**Guess handling:** on Enter (or clicking a suggestion then Enter — clicking a
suggestion only fills the input, matching the mockup), trim + lowercase the input and
check membership in the current answer's `aliases`. Max 3 attempts
(`MAX_TRIES = 3`, unchanged from mockup). Wrong guesses progressively reveal hints in
order: generic ("Wrong guess reveals a hint.") → industry → founding year. Reaching 3
wrong guesses ends the game as `"lost"`; a correct guess ends it as `"won"`.

**Autocomplete suggestions:** filter the full set of names across the entire logo
bank (not just today's decoys) by case-insensitive prefix match on the input value,
excluding the current day's answer once the game is over, capped to 4 results —
same behavior as the mockup's `suggestionsFor`.

## Persistence (localStorage)

- `logodle_dark_v1` — `"1"` / `"0"`, dark mode preference.
- `logodle_history_v1` — JSON map `{ [dayIndex: string]: "won" | "lost" }`, one entry
  per completed day, written when a day's game ends.
- `logodle_today_v1` — JSON `{ dayIndex, guesses, status }` for the in-progress or
  just-completed current day, so a page reload restores exact state instead of
  losing progress or allowing a replay. Cleared/overwritten when `dayIndex` changes
  (new day).

**Streak:** derived at load time, not stored directly — walk backward day-by-day from
the most recently completed day, counting consecutive `"won"` entries in
`logodle_history_v1` until a gap or a `"lost"` breaks the streak.

**Archive:** built at render time by checking the 5 day-indices immediately before
today against `logodle_history_v1`: green dot if `"won"`, red if `"lost"`, faint/
border dot if absent (day existed but wasn't played — including all days before the
epoch, which are simply never present in history). Purely informational, no click
behavior.

**Countdown:** `setInterval` (1s) computing time remaining until the next local
midnight, formatted `HH:MM:SS`, unchanged from the mockup.

## Styling

CSS custom properties in `src/styles/global.css` under `:root` (light theme) and
`[data-theme="dark"]` (dark overrides) — replacing the mockup's per-element inline
`style="...{{ theme.x }}..."` bindings with real, static CSS. The dark-mode toggle
flips `document.documentElement.dataset.theme` and persists the choice; no per-element
inline style rewriting in JS. Layout (flex column page, centered 380px card, header
bar), the three reveal keyframe animations, and the Inter font load (Google Fonts
`<link>`) carry over unchanged from the mockup.

## Testing

Manual verification only, via `astro dev --background`: fresh win, a full loss (3
wrong guesses with all 3 hints shown in order), autocomplete filtering and
click-to-fill, dark mode toggle + persistence across reload, archive strip reflecting
a manually-seeded `logodle_history_v1`, mid-game reload restoring state, and day
rollover math spot-checked against a couple of manual date calculations. No automated
test runner is introduced.
