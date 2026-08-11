# Day Simulator Devtool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dev-only floating panel to the "Guess the Logo" game that lets the developer jump the game's notion of "today" to any date, so day rotation, streaks, archive state, and countdown/rollover behavior can be tested without waiting for real days to pass.

**Architecture:** A new `src/scripts/clock.js` module becomes the single source of "now" for the app (a real-time-plus-in-memory-offset clock). `game.js` is changed to read time exclusively through it and gains a `reloadDay()` re-derivation path triggered by a `logodle:clock-changed` window event, instead of computing `dayIndex`/state only once at load. A new `src/scripts/devtools.js` module mounts a small floating panel (date picker, ±1 day, reset) that calls into `clock.js`; the panel markup and its mounting script are gated behind `import.meta.env.DEV` in `src/pages/index.astro` so neither ships in a production build.

**Tech Stack:** Astro 7 (already installed), vanilla JS (ES modules), plain CSS with custom properties. No new dependencies.

Spec reference: `docs/superpowers/specs/2026-08-04-day-simulator-devtool-design.md`

## Global Constraints

- No new dependencies.
- No automated test runner is introduced. Verify manually via `astro dev --background` / `astro dev logs` / `astro dev stop` (per this project's CLAUDE.md), plus throwaway `node -e` sanity checks for pure additions where that's meaningful.
- Do not create git commits during implementation — the user asked not to commit anything for this feature; leave the working tree uncommitted for them to review and commit themselves.
- The simulated clock offset lives only in an in-memory module variable in `src/scripts/clock.js`. It must reset to `0` on every page reload — never persist it to `localStorage`/`sessionStorage`.
- `clock.js`'s mutating exports (`setSimulatedDate`, `nudgeDays`, `resetClock`) must each start with `if (!import.meta.env?.DEV) return;` (defense-in-depth). The `?.` is required: plain `node -e` sanity checks run outside Vite, where `import.meta.env` is `undefined`, and `import.meta.env.DEV` (no `?.`) would throw there.
- The devtools panel markup and its mounting `<script>` in `src/pages/index.astro` must both be wrapped in `{import.meta.env.DEV && (...)}` so they are entirely absent from `astro build` output.
- The clock-change event name is exactly `"logodle:clock-changed"` — used by `clock.js` (dispatch) and `game.js` (listener). Keep it consistent.
- Everywhere `game.js`'s runtime logic needs the current time (computing `dayIndex`, the countdown's `nextLocalMidnight`, the 1s ticker), it must call `now()` from `clock.js` — not `new Date()` / `Date.now()` directly. (`dayIndexFor`'s and `nextLocalMidnight`'s own default parameters may keep `new Date()`, since those functions stay pure/testable and every call site inside `initGame` passes `now()` explicitly anyway.)

---

### Task 1: Clock module

**Files:**
- Create: `src/scripts/clock.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `export function now()` → `Date` (real time + in-memory offset),
  `export function isSimulated()` → `boolean`,
  `export function setSimulatedDate(date: Date)`,
  `export function nudgeDays(n: number)`,
  `export function resetClock()`.
  Dispatches `window.dispatchEvent(new Event("logodle:clock-changed"))` whenever the
  offset changes. Task 2 (`game.js`) consumes `now()`; Task 3 (`devtools.js`)
  consumes all five exports.

- [ ] **Step 1: Create the clock module**

```js
// src/scripts/clock.js
let offsetMs = 0;

export function now() {
  return new Date(Date.now() + offsetMs);
}

export function isSimulated() {
  return offsetMs !== 0;
}

function applyOffset(targetDate) {
  offsetMs = targetDate.getTime() - Date.now();
  window.dispatchEvent(new Event("logodle:clock-changed"));
}

export function setSimulatedDate(date) {
  if (!import.meta.env?.DEV) return;
  applyOffset(date);
}

export function nudgeDays(n) {
  if (!import.meta.env?.DEV) return;
  applyOffset(new Date(now().getTime() + n * 86400000));
}

export function resetClock() {
  if (!import.meta.env?.DEV) return;
  offsetMs = 0;
  window.dispatchEvent(new Event("logodle:clock-changed"));
}
```

- [ ] **Step 2: Sanity-check with a throwaway Node command**

This also verifies the defense-in-depth guard: run outside Vite (plain `node -e`),
`import.meta.env` is `undefined`, so the mutators must be no-ops.

Run:

```bash
node -e "
import('./src/scripts/clock.js').then(({ now, isSimulated, setSimulatedDate, nudgeDays, resetClock }) => {
  console.log('isSimulated initial:', isSimulated());
  const before = now().getTime();
  setSimulatedDate(new Date(2030, 0, 1));
  console.log('isSimulated after setSimulatedDate outside Vite:', isSimulated());
  console.log('now() unchanged outside Vite:', Math.abs(now().getTime() - before) < 2000);
  nudgeDays(5);
  resetClock();
  console.log('still unsimulated after nudge/reset outside Vite:', !isSimulated());
});
"
```

Expected: `isSimulated initial: false`, `isSimulated after setSimulatedDate outside
Vite: false`, `now() unchanged outside Vite: true`, `still unsimulated after
nudge/reset outside Vite: true`.

- [ ] **Step 3: Mark task complete**

No commit — leave the new file uncommitted (per Global Constraints).

---

### Task 2: Wire the simulated clock into the game loop

**Files:**
- Modify: `src/scripts/game.js` (full replacement, extending the existing version)

**Interfaces:**
- Consumes: `now()` from `src/scripts/clock.js` (Task 1); everything already
  produced by the existing `game.js` (`dayIndexFor`, `pickLogo`, `isCorrectGuess`,
  `suggestionsFor`, `formatCountdown`, `nextLocalMidnight`, `computeStreak`,
  `initGame`, and the `logodle_today_v1` / `logodle_history_v1` / `logodle_dark_v1`
  localStorage keys) — none of these signatures change.
- Produces: `initGame()` now listens for `window`'s `"logodle:clock-changed"` event
  (dispatched by `clock.js`) and re-derives `dayIndex`/`logo`/`guesses`/`status`/
  `history` from storage via an internal `reloadDay()` function, then re-renders —
  without re-attaching any DOM event listeners. This is what Task 3's devtools panel
  relies on: calling `clock.js`'s mutators is enough to make the whole game act as if
  the simulated date were real.

- [ ] **Step 1: Replace `src/scripts/game.js` with the clock-aware version**

```js
// src/scripts/game.js
import { LOGOS } from "../data/logos.js";
import { now } from "./clock.js";

const EPOCH = new Date(2024, 0, 1);
const MAX_TRIES = 3;
const ARCHIVE_DAYS = 5;
const TODAY_KEY = "logodle_today_v1";
const HISTORY_KEY = "logodle_history_v1";
const DARK_KEY = "logodle_dark_v1";

function localMidnight(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function dayIndexFor(date, epoch = EPOCH) {
  const ms = localMidnight(date).getTime() - localMidnight(epoch).getTime();
  return Math.floor(ms / 86400000);
}

export function pickLogo(bank, dayIndex) {
  const i = ((dayIndex % bank.length) + bank.length) % bank.length;
  return bank[i];
}

export function isCorrectGuess(text, logo) {
  const q = text.trim().toLowerCase();
  return logo.aliases.includes(q);
}

export function suggestionsFor(value, bank, excludeName) {
  if (!value || value.trim().length < 1) return [];
  const q = value.trim().toLowerCase();
  return bank
    .map((l) => l.name)
    .filter((name) => name.toLowerCase().startsWith(q) && name !== excludeName)
    .slice(0, 4);
}

export function formatCountdown(ms) {
  const clamped = Math.max(0, ms);
  const s = Math.floor(clamped / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function nextLocalMidnight(from = new Date()) {
  const d = localMidnight(from);
  d.setDate(d.getDate() + 1);
  return d;
}

export function computeStreak(history, todayIndex) {
  let i = todayIndex;
  if (history[String(i)] === undefined) i -= 1;
  let streak = 0;
  while (history[String(i)] === "won") {
    streak += 1;
    i -= 1;
  }
  return streak;
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

function loadDark() {
  try {
    return localStorage.getItem(DARK_KEY) === "1";
  } catch (e) {
    return false;
  }
}

function saveDark(v) {
  try {
    localStorage.setItem(DARK_KEY, v ? "1" : "0");
  } catch (e) {}
}

export function initGame() {
  const bank = LOGOS;
  let history = loadJSON(HISTORY_KEY, {});

  const state = {
    dayIndex: 0,
    logo: null,
    value: "",
    guesses: [],
    status: "playing",
    archiveOpen: false,
    dark: loadDark(),
    now: now().getTime(),
  };

  const els = {
    dayLabel: document.getElementById("day-label"),
    logoSvg: document.getElementById("logo-svg"),
    guessesEl: document.getElementById("guesses"),
    playArea: document.getElementById("play-area"),
    input: document.getElementById("guess-input"),
    suggestions: document.getElementById("suggestions"),
    dots: document.getElementById("dots"),
    hint: document.getElementById("hint"),
    reveal: document.getElementById("reveal"),
    revealName: document.getElementById("reveal-name"),
    revealFact: document.getElementById("reveal-fact"),
    shareGrid: document.getElementById("share-grid"),
    streakText: document.getElementById("streak-text"),
    countdownText: document.getElementById("countdown-text"),
    archiveToggle: document.getElementById("archive-toggle"),
    archivePanel: document.getElementById("archive-panel"),
    archiveArrow: document.getElementById("archive-arrow"),
    archiveDays: document.getElementById("archive-days"),
    darkToggle: document.getElementById("dark-toggle"),
  };

  function applyTheme() {
    document.documentElement.dataset.theme = state.dark ? "dark" : "light";
    els.darkToggle.dataset.on = String(state.dark);
  }

  function persistToday() {
    saveJSON(TODAY_KEY, { dayIndex: state.dayIndex, guesses: state.guesses, status: state.status });
  }

  function finishDay(result) {
    history[String(state.dayIndex)] = result;
    saveJSON(HISTORY_KEY, history);
  }

  function submitGuess(text) {
    if (state.status !== "playing" || !text.trim()) return;
    const correct = isCorrectGuess(text, state.logo);
    state.guesses = [...state.guesses, { text: text.trim(), correct }];
    if (correct) {
      state.status = "won";
    } else if (state.guesses.length >= MAX_TRIES) {
      state.status = "lost";
    }
    state.value = "";
    if (state.status !== "playing") finishDay(state.status);
    persistToday();
    render();
  }

  function renderArchive() {
    els.archiveArrow.textContent = state.archiveOpen ? "▲" : "▼";
    els.archivePanel.hidden = !state.archiveOpen;
    if (!state.archiveOpen) return;

    els.archiveDays.innerHTML = "";
    for (let offset = 1; offset <= ARCHIVE_DAYS; offset++) {
      const idx = state.dayIndex - offset;
      if (idx < 0) continue;
      const result = history[String(idx)];

      const row = document.createElement("div");
      row.className = "archive-day";

      const dot = document.createElement("span");
      dot.className =
        "archive-dot " +
        (result === "won" ? "archive-won" : result === "lost" ? "archive-lost" : "archive-unplayed");
      row.appendChild(dot);

      const num = document.createElement("span");
      num.textContent = `#${idx + 1}`;
      row.appendChild(num);

      const label = document.createElement("span");
      label.className = "archive-day-label";
      label.textContent = result === "won" ? "Solved" : result === "lost" ? "Missed" : "Not played";
      row.appendChild(label);

      els.archiveDays.appendChild(row);
    }
  }

  function renderCountdownAndStreak() {
    const streak = computeStreak(history, state.dayIndex);
    els.streakText.textContent = `streak ${streak}`;
    els.countdownText.textContent = `next in ${formatCountdown(nextLocalMidnight(now()).getTime() - state.now)}`;
  }

  function renderSuggestions() {
    const sugg = suggestionsFor(state.value, bank, null);
    if (sugg.length > 0) {
      els.suggestions.hidden = false;
      els.suggestions.innerHTML = "";
      for (const name of sugg) {
        const item = document.createElement("div");
        item.className = "suggestion";
        item.textContent = name;
        item.addEventListener("click", () => {
          state.value = name;
          render();
          els.input.focus();
        });
        els.suggestions.appendChild(item);
      }
    } else {
      els.suggestions.hidden = true;
      els.suggestions.innerHTML = "";
    }
  }

  function render() {
    const isPlaying = state.status === "playing";
    const isOver = !isPlaying;
    const attemptCount = state.guesses.length;

    els.dayLabel.textContent = isPlaying
      ? `GUESS THE LOGO · #${state.dayIndex + 1}`
      : state.status === "won"
        ? `SOLVED — #${state.dayIndex + 1}`
        : `MISSED — #${state.dayIndex + 1}`;

    els.logoSvg.setAttribute("viewBox", state.logo.viewBox);
    els.logoSvg.innerHTML = state.logo.svgPath;
    els.logoSvg.dataset.status = isOver ? state.status : "playing";

    els.guessesEl.innerHTML = "";
    for (const g of state.guesses) {
      const div = document.createElement("div");
      div.className = "guess-tile " + (g.correct ? "guess-correct" : "guess-wrong");
      div.textContent = g.text;
      els.guessesEl.appendChild(div);
    }

    els.playArea.hidden = !isPlaying;
    els.reveal.hidden = !isOver;

    if (isPlaying) {
      els.input.value = state.value;
      const hints = [
        "Wrong guess reveals a hint.",
        `Industry: ${state.logo.industry}`,
        `Founded: ${state.logo.founded}`,
      ];
      els.hint.textContent = hints[Math.min(attemptCount, hints.length - 1)];

      els.dots.innerHTML = "";
      for (let i = 0; i < MAX_TRIES; i++) {
        const dot = document.createElement("span");
        dot.className = "dot" + (i < attemptCount ? " dot-used" : "");
        els.dots.appendChild(dot);
      }

      renderSuggestions();
    } else {
      els.revealName.textContent = state.logo.name;
      els.revealFact.textContent = state.logo.funFact;

      els.shareGrid.innerHTML = "";
      for (let i = 0; i < MAX_TRIES; i++) {
        const g = state.guesses[i];
        const cell = document.createElement("span");
        cell.className =
          "share-cell " + (g ? (g.correct ? "share-correct" : "share-wrong") : "share-empty");
        els.shareGrid.appendChild(cell);
      }

      renderCountdownAndStreak();
    }

    renderArchive();
  }

  function loadDay() {
    state.dayIndex = dayIndexFor(now());
    state.logo = pickLogo(bank, state.dayIndex);
    const savedToday = loadJSON(TODAY_KEY, null);
    const resuming = savedToday && savedToday.dayIndex === state.dayIndex;
    state.guesses = resuming ? savedToday.guesses : [];
    state.status = resuming ? savedToday.status : "playing";
    state.value = "";
    history = loadJSON(HISTORY_KEY, {});
  }

  function reloadDay() {
    loadDay();
    render();
  }

  els.input.addEventListener("input", (e) => {
    state.value = e.target.value;
    renderSuggestions();
  });
  els.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitGuess(state.value);
  });
  els.archiveToggle.addEventListener("click", () => {
    state.archiveOpen = !state.archiveOpen;
    renderArchive();
  });
  els.darkToggle.addEventListener("click", () => {
    state.dark = !state.dark;
    saveDark(state.dark);
    applyTheme();
  });
  window.addEventListener("logodle:clock-changed", reloadDay);

  setInterval(() => {
    state.now = now().getTime();
    if (state.status !== "playing") {
      renderCountdownAndStreak();
    }
  }, 1000);

  applyTheme();
  loadDay();
  render();
}
```

- [ ] **Step 2: Sanity-check the unchanged pure functions still work, via Node**

Run:

```bash
node -e "
import('./src/scripts/game.js').then(({ dayIndexFor, pickLogo, isCorrectGuess, suggestionsFor, formatCountdown, computeStreak }) => {
  const epoch = new Date(2024, 0, 1);
  console.log('epoch day index:', dayIndexFor(epoch, epoch));
  console.log('day after epoch:', dayIndexFor(new Date(2024, 0, 2), epoch));
  const bank = [
    { name: 'Vue.js', aliases: ['vue', 'vue.js', 'vuejs'] },
    { name: 'Netflix', aliases: ['netflix'] },
  ];
  console.log('pickLogo(0):', pickLogo(bank, 0).name);
  console.log('pickLogo(2) wraps to 0:', pickLogo(bank, 2).name);
  console.log('isCorrectGuess vue:', isCorrectGuess(' Vue ', bank[0]));
  console.log('suggestionsFor ne:', suggestionsFor('ne', bank, null));
  console.log('formatCountdown 3661000ms:', formatCountdown(3661000));
  console.log('computeStreak broken by loss:', computeStreak({ '5': 'lost', '4': 'won' }, 5));
});
"
```

Expected: `epoch day index: 0`, `day after epoch: 1`, `pickLogo(0): Vue.js`,
`pickLogo(2) wraps to 0: Vue.js`, `isCorrectGuess vue: true`,
`suggestionsFor ne: [ 'Netflix' ]`, `formatCountdown 3661000ms: 01:01:01`,
`computeStreak broken by loss: 0`. This confirms the refactor didn't change any pure
function's behavior.

- [ ] **Step 3: Manually verify the game still plays normally (no devtool yet)**

Run: `astro dev --background`, then open `http://localhost:4321`.

Expected: identical behavior to before this task — today's real logo loads, guessing
works, wrong guesses reveal hints, winning/losing shows the reveal. This confirms
routing all time through `now()` (which equals real time until Task 3's panel calls
`clock.js`'s mutators) didn't break anything. Run `astro dev stop` when done.

- [ ] **Step 4: Mark task complete**

No commit — leave the changes uncommitted (per Global Constraints).

---

### Task 3: Day simulator panel

**Files:**
- Create: `src/scripts/devtools.js`
- Modify: `src/styles/global.css` (append devtool styles)
- Modify: `src/pages/index.astro` (add dev-only panel markup + mounting script)

**Interfaces:**
- Consumes: `now`, `isSimulated`, `setSimulatedDate`, `nudgeDays`, `resetClock` from
  `src/scripts/clock.js` (Task 1); relies on Task 2's `game.js` listening for
  `"logodle:clock-changed"` to actually update the game when the panel changes the
  clock.
- Produces: `export function mountDevtools()` — queries the panel's DOM (created in
  this task) and wires its controls. Only called from the dev-only script block in
  `index.astro`, so it's never invoked (or bundled) in a production build.

- [ ] **Step 1: Create the devtools panel module**

```js
// src/scripts/devtools.js
import { now, isSimulated, setSimulatedDate, nudgeDays, resetClock } from "./clock.js";

function formatDateInput(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function mountDevtools() {
  const toggle = document.getElementById("devtools-toggle");
  const panel = document.getElementById("devtools-panel");
  const status = document.getElementById("devtools-status");
  const dateInput = document.getElementById("devtools-date");
  const jumpBtn = document.getElementById("devtools-jump");
  const prevBtn = document.getElementById("devtools-prev");
  const nextBtn = document.getElementById("devtools-next");
  const resetBtn = document.getElementById("devtools-reset");

  function renderStatus() {
    status.textContent = isSimulated() ? `Simulated: ${now().toDateString()}` : "Real time";
    dateInput.value = formatDateInput(now());
  }

  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
  });

  jumpBtn.addEventListener("click", () => {
    const [y, m, d] = dateInput.value.split("-").map(Number);
    if (!y || !m || !d) return;
    const target = now();
    target.setFullYear(y, m - 1, d);
    setSimulatedDate(target);
  });

  prevBtn.addEventListener("click", () => nudgeDays(-1));
  nextBtn.addEventListener("click", () => nudgeDays(1));
  resetBtn.addEventListener("click", () => resetClock());

  window.addEventListener("logodle:clock-changed", renderStatus);

  renderStatus();
}
```

- [ ] **Step 2: Append the panel styles**

Append to the end of `src/styles/global.css`:

```css
.devtools {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 10;
}

.devtools-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--card-bg);
  cursor: pointer;
  font-size: 16px;
}

.devtools-panel {
  position: absolute;
  right: 0;
  bottom: 44px;
  width: 220px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
}

.devtools-panel:not([hidden]) {
  display: flex;
}

.devtools-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.devtools-date {
  flex: 1;
  font: inherit;
  color: var(--text);
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px;
}

.devtools-row button {
  font: inherit;
  color: var(--text);
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
}
```

- [ ] **Step 3: Add the dev-only panel markup and mounting script**

In `src/pages/index.astro`, replace the existing closing section:

```astro
		<script>
			import { initGame } from "../scripts/game.js";
			initGame();
		</script>
	</body>
</html>
```

with:

```astro
		{import.meta.env.DEV && (
			<div class="devtools" id="devtools">
				<button type="button" class="devtools-toggle" id="devtools-toggle" aria-label="Toggle day simulator">🛠</button>
				<div class="devtools-panel" id="devtools-panel" hidden>
					<div class="devtools-row" id="devtools-status">Real time</div>
					<div class="devtools-row">
						<input type="date" id="devtools-date" class="devtools-date" />
						<button type="button" id="devtools-jump">Jump</button>
					</div>
					<div class="devtools-row">
						<button type="button" id="devtools-prev">−1 day</button>
						<button type="button" id="devtools-next">+1 day</button>
						<button type="button" id="devtools-reset">Reset to now</button>
					</div>
				</div>
			</div>
		)}

		<script>
			import { initGame } from "../scripts/game.js";
			initGame();
		</script>

		{import.meta.env.DEV && (
			<script>
				import { mountDevtools } from "../scripts/devtools.js";
				mountDevtools();
			</script>
		)}
	</body>
</html>
```

- [ ] **Step 4: Manually verify the panel in the dev server**

Run: `astro dev --background`, then open `http://localhost:4321`.

1. A small "🛠" button should be visible bottom-right. Click it — the panel expands
   showing "Real time", a date input pre-filled with today's date, Jump, −1 day,
   +1 day, and Reset to now.
2. Pick a date a few days in the future in the date input and click "Jump" — the
   logo, day label (`#N`), and hint should immediately update to that day's puzzle,
   and the status line should read `Simulated: <that date>`.
3. Click "−1 day" a couple of times — the day label's `#N` should decrement each
   click and the logo should change accordingly.
4. Play and finish a simulated day's game (win or lose), then click "+1 day" then
   "−1 day" back to it — your guesses and result for that simulated day should be
   restored exactly (proving `reloadDay()` reads `logodle_today_v1` correctly for
   the new `dayIndex`).
5. Click "Reset to now" — status should return to "Real time" and the game should
   show the actual current day's puzzle again.
6. Reload the page (no interaction with the panel first) after having jumped to a
   future date — the game should come back showing the real current day, not the
   simulated one (confirms the offset doesn't persist across reloads).

Run `astro dev stop` when done.

- [ ] **Step 5: Mark task complete**

No commit — leave the changes uncommitted (per Global Constraints).

---

### Task 4: End-to-end QA pass

**Files:** none (verification only).

**Interfaces:** none — this task only exercises what Tasks 1-3 built.

- [ ] **Step 1: Production build excludes the devtool**

Run: `astro build`

Expected: build succeeds with no errors or warnings.

Then run:

```bash
grep -o 'devtools[a-zA-Z-]*' dist/index.html | sort -u
```

Expected: no output (empty) — confirms none of the `devtools-*` element IDs or the
`devtools` class appear in the built HTML, i.e. the panel markup was excluded.

- [ ] **Step 2: Preview the production build behaves like a real player would see**

Run: `astro preview`, open the printed local URL.

Expected: no "🛠" button anywhere on the page; today's puzzle loads and plays
normally (guess, hints, win/lose, dark mode, archive, countdown) exactly as before
this feature existed. Open the browser devtools console — no errors. Stop the
preview server with Ctrl+C when done.

- [ ] **Step 3: Rollover behavior in the dev server**

Run: `astro dev --background`, open `http://localhost:4321`, open the day simulator
panel.

1. Jump to a date, let a game finish (win or lose) on that simulated day, then use
   "+1 day" — the game should reset to a fresh "playing" state for the new
   simulated day (not carry over the previous day's guesses), and the archive strip
   (if opened) should now show the previous simulated day as its most recent
   completed entry.
2. With a couple of simulated days won in a row (jump back and forth completing
   each with a win), reset to now and re-jump through them again — the streak
   number shown after finishing a later day should count the consecutive
   simulated wins, confirming `computeStreak` reads the same `logodle_history_v1`
   data the simulator wrote.

Run `astro dev stop` when done.

- [ ] **Step 4: Mark task complete**

No commit — the user will review and commit this work themselves (per Global
Constraints).
