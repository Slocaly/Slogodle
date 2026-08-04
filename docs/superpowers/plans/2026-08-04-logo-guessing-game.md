# Guess the Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a daily "Guess the Logo" browser game in this Astro project: a company logo is shown, the player has 3 guesses (with autocomplete), wrong guesses reveal progressive hints, and the puzzle rotates daily from a curated bank of 16 logos.

**Architecture:** One Astro page (`src/pages/index.astro`) with static markup, styled by `src/styles/global.css` (CSS custom properties for light/dark theme), driven entirely by one client-side vanilla JS module (`src/scripts/game.js`) that reads a static data bank (`src/data/logos.js`). No framework, no backend — all state is localStorage.

**Tech Stack:** Astro 7 (already installed), vanilla JS (ES modules), plain CSS with custom properties. No new dependencies.

Spec reference: `docs/superpowers/specs/2026-08-04-logo-guessing-game-design.md`

## Global Constraints

- No new dependencies — implementation uses only the existing `astro` package. Do not add `@astrojs/react` or any UI framework.
- No automated test runner is introduced. Verification is manual: run the dev server per this project's CLAUDE.md (`astro dev --background`, `astro dev logs`, `astro dev stop`) and exercise the feature in a browser; pure functions are additionally sanity-checked with throwaway `node -e` commands (Node's ESM loader, not a test framework — the project's `package.json` already has `"type": "module"`).
- Do not create git commits during implementation — the user asked not to commit anything for this feature; leave the working tree uncommitted for them to review and commit themselves.
- Epoch constant is `new Date(2024, 0, 1)` (local time) = day index `0`. This exact value must be used everywhere day index is computed.
- `MAX_TRIES = 3` everywhere guesses are capped.
- Archive shows the 5 day-indices immediately preceding today (`ARCHIVE_DAYS = 5`), read-only, no click behavior.
- Share grid after game end is visual-only — no clipboard/copy action.
- Theme colors must match the spec's `oklch(...)` values exactly (see Task 2).

---

### Task 1: Logo bank data

**Files:**
- Create: `src/data/logos.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `export const LOGOS` — an array of 16 objects, each shaped
  `{ name: string, aliases: string[], industry: string, founded: number, funFact: string, viewBox: string, svgPath: string }`.
  `aliases` are lowercase strings matched against a trimmed, lowercased guess. `svgPath`
  is a string of inner SVG markup (one or more `<path>`/`<circle>`/`<rect>`/`<polygon>`/
  `<polyline>` elements) using `fill="currentColor"` for the logo's "ink" and
  `fill="var(--card-bg)"` for any punched-out holes, so the mark recolors with the
  page theme and win/lose state, and shows the card background through its holes.
  `viewBox` is the exact string to set as the `<svg>`'s `viewBox` attribute.

- [ ] **Step 1: Create the data file**

```js
// src/data/logos.js
export const LOGOS = [
  {
    name: "Vue.js",
    aliases: ["vue", "vue.js", "vuejs"],
    industry: "Software",
    founded: 2014,
    funFact:
      "Vue was created by Evan You after working at Google, aiming to pull the best parts of Angular into something lighter.",
    viewBox: "0 0 261 226",
    svgPath:
      '<path d="M204.8 0H261L130.5 226L0 0H100.9L130.5 51.2L159.5 0H204.8Z" fill="currentColor"/><path d="M0 0L130.5 226L261 0H204.8L130.5 130.4L55.5 0H0Z" fill="currentColor" opacity="0.75"/>',
  },
  {
    name: "Mastercard",
    aliases: ["mastercard", "master card"],
    industry: "Finance",
    founded: 1966,
    funFact:
      "Mastercard launched as 'Master Charge' in 1966, a card program formed by a group of California banks.",
    viewBox: "0 0 100 100",
    svgPath:
      '<circle cx="40" cy="50" r="28" fill="currentColor"/><circle cx="60" cy="50" r="28" fill="currentColor" opacity="0.6"/>',
  },
  {
    name: "Target",
    aliases: ["target"],
    industry: "Retail",
    founded: 1902,
    funFact:
      "Target's bullseye logo has been in continuous use since 1962, the same year the first Target store opened.",
    viewBox: "0 0 100 100",
    svgPath:
      '<circle cx="50" cy="50" r="42" fill="currentColor"/><circle cx="50" cy="50" r="28" fill="var(--card-bg)"/><circle cx="50" cy="50" r="14" fill="currentColor"/>',
  },
  {
    name: "Adidas",
    aliases: ["adidas"],
    industry: "Apparel",
    founded: 1949,
    funFact:
      "Adidas was founded by Adolf 'Adi' Dassler after splitting from his brother's shoe company, which became Puma.",
    viewBox: "0 0 100 100",
    svgPath:
      '<polygon points="55,20 75,20 68,35 48,35" fill="currentColor"/><polygon points="40,45 68,45 60,60 32,60" fill="currentColor"/><polygon points="25,70 78,70 70,85 17,85" fill="currentColor"/>',
  },
  {
    name: "Pinterest",
    aliases: ["pinterest"],
    industry: "Software",
    founded: 2010,
    funFact: "Pinterest's name is a blend of the words 'pin' and 'interest'.",
    viewBox: "0 0 100 100",
    svgPath:
      '<circle cx="50" cy="40" r="32" fill="currentColor"/><path d="M42 55 C42 75, 48 92, 54 96 C58 88, 56 70, 58 55 Z" fill="var(--card-bg)"/>',
  },
  {
    name: "Spotify",
    aliases: ["spotify"],
    industry: "Music streaming",
    founded: 2006,
    funFact:
      "Spotify's name was reportedly the result of a mishearing of a name idea shouted across a room by its co-founder.",
    viewBox: "0 0 100 100",
    svgPath:
      '<circle cx="50" cy="50" r="42" fill="currentColor"/><path d="M28 40 Q50 28 72 40" fill="none" stroke="var(--card-bg)" stroke-width="6" stroke-linecap="round"/><path d="M25 55 Q50 38 75 55" fill="none" stroke="var(--card-bg)" stroke-width="6" stroke-linecap="round"/><path d="M23 70 Q50 48 77 70" fill="none" stroke="var(--card-bg)" stroke-width="6" stroke-linecap="round"/>',
  },
  {
    name: "YouTube",
    aliases: ["youtube"],
    industry: "Video",
    founded: 2005,
    funFact: "YouTube's first ever video, titled 'Me at the zoo', was uploaded in April 2005.",
    viewBox: "0 0 100 100",
    svgPath:
      '<rect x="10" y="28" width="80" height="44" rx="14" fill="currentColor"/><polygon points="42,40 42,60 62,50" fill="var(--card-bg)"/>',
  },
  {
    name: "Bluetooth",
    aliases: ["bluetooth"],
    industry: "Wireless standard",
    founded: 1998,
    funFact:
      "Bluetooth is named after the 10th-century Danish king Harald 'Bluetooth' Gormsson, and its logo merges the Runic letters for H and B.",
    viewBox: "0 0 100 100",
    svgPath:
      '<path d="M50,12 L68,30 L50,48 L68,66 L50,88 L50,48 L32,66 L50,48 L32,30 Z" fill="currentColor"/>',
  },
  {
    name: "X (Twitter)",
    aliases: ["x", "twitter"],
    industry: "Social media",
    founded: 2006,
    funFact: "The service launched as Twitter in 2006 and was rebranded to X in 2023.",
    viewBox: "0 0 100 100",
    svgPath:
      '<polygon points="20,15 35,15 80,85 65,85" fill="currentColor"/><polygon points="65,15 80,15 35,85 20,85" fill="currentColor"/>',
  },
  {
    name: "WordPress",
    aliases: ["wordpress"],
    industry: "Software",
    founded: 2003,
    funFact: "WordPress now powers over 40% of all websites on the internet.",
    viewBox: "0 0 100 100",
    svgPath:
      '<circle cx="50" cy="50" r="42" fill="currentColor"/><polyline points="28,38 36,64 44,44 52,64 60,44 68,64 74,38" fill="none" stroke="var(--card-bg)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    name: "Slack",
    aliases: ["slack"],
    industry: "Software",
    founded: 2013,
    funFact:
      "Slack started life as an internal communication tool built for a video game company whose game never shipped.",
    viewBox: "0 0 100 100",
    svgPath:
      '<rect x="38" y="15" width="10" height="70" rx="5" fill="currentColor"/><rect x="52" y="15" width="10" height="70" rx="5" fill="currentColor"/><rect x="15" y="38" width="70" height="10" rx="5" fill="currentColor"/><rect x="15" y="52" width="70" height="10" rx="5" fill="currentColor"/>',
  },
  {
    name: "Netflix",
    aliases: ["netflix"],
    industry: "Entertainment",
    founded: 1997,
    funFact: "Netflix started as a DVD-by-mail rental service years before it offered streaming.",
    viewBox: "0 0 100 100",
    svgPath:
      '<polygon points="25,10 40,10 60,65 60,10 75,10 75,90 60,90 40,35 40,90 25,90" fill="currentColor"/>',
  },
  {
    name: "npm",
    aliases: ["npm"],
    industry: "Software",
    founded: 2009,
    funFact: "npm is commonly expanded to 'Node Package Manager', though that's technically a backronym.",
    viewBox: "0 0 100 100",
    svgPath:
      '<rect x="10" y="30" width="80" height="40" fill="currentColor"/><rect x="24" y="38" width="8" height="24" fill="var(--card-bg)"/><rect x="24" y="38" width="32" height="8" fill="var(--card-bg)"/><rect x="48" y="38" width="8" height="24" fill="var(--card-bg)"/>',
  },
  {
    name: "Chrome",
    aliases: ["chrome", "google chrome"],
    industry: "Software",
    founded: 2008,
    funFact: "Chrome's 2008 launch announcement was a comic book explaining the browser's design.",
    viewBox: "0 0 100 100",
    svgPath:
      '<circle cx="50" cy="50" r="42" fill="currentColor"/><circle cx="50" cy="50" r="34" fill="var(--card-bg)"/><circle cx="50" cy="50" r="16" fill="currentColor"/><rect x="50" y="50" width="42" height="8" fill="currentColor"/>',
  },
  {
    name: "Instagram",
    aliases: ["instagram"],
    industry: "Social media",
    founded: 2010,
    funFact: "Instagram's name blends the words 'instant camera' and 'telegram'.",
    viewBox: "0 0 100 100",
    svgPath:
      '<rect x="14" y="14" width="72" height="72" rx="20" fill="currentColor"/><rect x="26" y="26" width="48" height="48" rx="12" fill="var(--card-bg)"/><circle cx="50" cy="50" r="16" fill="currentColor"/><circle cx="50" cy="50" r="8" fill="var(--card-bg)"/><circle cx="70" cy="30" r="4" fill="currentColor"/>',
  },
  {
    name: "Google Maps",
    aliases: ["google maps", "maps"],
    industry: "Software",
    founded: 2005,
    funFact:
      "Google Maps launched in 2005 after Google acquired the Australian startup that built its core mapping technology.",
    viewBox: "0 0 100 100",
    svgPath:
      '<path d="M50 10 C68 10 82 24 82 42 C82 64 50 92 50 92 C50 92 18 64 18 42 C18 24 32 10 50 10 Z" fill="currentColor"/><circle cx="50" cy="42" r="14" fill="var(--card-bg)"/>',
  },
];
```

- [ ] **Step 2: Sanity-check the data with a throwaway Node command**

Run:

```bash
node -e "
import('./src/data/logos.js').then(({ LOGOS }) => {
  console.log('count:', LOGOS.length);
  const bad = LOGOS.filter(l =>
    !l.name || !Array.isArray(l.aliases) || l.aliases.length === 0 ||
    !l.industry || typeof l.founded !== 'number' || !l.funFact ||
    !l.viewBox || !l.svgPath
  );
  console.log('malformed entries:', bad.length);
  const dupeNames = LOGOS.map(l => l.name).filter((n, i, arr) => arr.indexOf(n) !== i);
  console.log('duplicate names:', dupeNames);
});
"
```

Expected: `count: 16`, `malformed entries: 0`, `duplicate names: []`.

- [ ] **Step 3: Mark task complete**

No commit — leave the new file uncommitted (per Global Constraints).

---

### Task 2: Theme tokens & static page shell

**Files:**
- Create: `src/styles/global.css`
- Modify: `src/pages/index.astro` (replace the starter placeholder content entirely)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: the DOM element IDs and classes that Task 3/4's `game.js` will query and
  manipulate. These exact IDs must exist for later tasks to work:
  `day-label`, `logo-svg`, `guesses`, `play-area`, `guess-input`, `suggestions`,
  `dots`, `hint`, `reveal`, `reveal-name`, `reveal-fact`, `share-grid`,
  `streak-text`, `countdown-text`, `archive-toggle`, `archive-panel`,
  `archive-arrow`, `archive-days`, `dark-toggle`, `dark-toggle-knob`.
  And these exact classes, which `game.js` will add/toggle:
  `guess-tile` + `guess-correct`/`guess-wrong`, `dot` + `dot-used`, `suggestion`,
  `share-cell` + `share-correct`/`share-wrong`/`share-empty`, `archive-day`,
  `archive-dot` + `archive-won`/`archive-lost`/`archive-unplayed`,
  `archive-day-label`.

- [ ] **Step 1: Create the stylesheet**

```css
/* src/styles/global.css */
:root {
  --bg: oklch(0.96 0.003 90);
  --card-bg: oklch(0.995 0 0);
  --panel-bg: oklch(0.99 0 0);
  --text: oklch(0.15 0 0);
  --muted: oklch(0.5 0 0);
  --faint: oklch(0.6 0 0);
  --border: oklch(0.88 0 0);
  --toggle-bg: oklch(0.85 0 0);
  --toggle-knob: oklch(0.995 0 0);
  --success: oklch(0.5 0.16 145);
  --danger: oklch(0.55 0.19 25);
}

[data-theme="dark"] {
  --bg: oklch(0.24 0.006 260);
  --card-bg: oklch(0.3 0.008 260);
  --panel-bg: oklch(0.28 0.008 260);
  --text: oklch(0.97 0 0);
  --muted: oklch(0.8 0.006 260);
  --faint: oklch(0.68 0.006 260);
  --border: oklch(0.42 0.008 260);
  --toggle-bg: oklch(0.55 0.14 255);
  --toggle-knob: oklch(0.97 0 0);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Inter", sans-serif;
  background: var(--bg);
  transition: background 0.25s;
}

::selection {
  background: oklch(0.8 0.1 250 / 0.3);
}

input::placeholder {
  opacity: 0.45;
}

a {
  color: oklch(0.5 0.18 255);
}

a:hover {
  color: oklch(0.4 0.18 255);
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  border-bottom: 1px solid var(--border);
}

.title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.archive-toggle {
  font: inherit;
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.archive-arrow {
  font-size: 11px;
  color: var(--faint);
}

.dark-toggle {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--toggle-bg);
  position: relative;
  cursor: pointer;
  border: none;
  padding: 0;
}

.dark-toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--toggle-knob);
  transition: left 0.2s;
}

.dark-toggle[data-on="true"] .dark-toggle-knob {
  left: 18px;
}

.archive-panel {
  border-bottom: 1px solid var(--border);
  background: var(--panel-bg);
}

.archive-panel:not([hidden]) {
  display: block;
}

.archive-days {
  padding: 18px 40px;
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
}

.archive-day {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted);
}

.archive-day-label {
  color: var(--faint);
}

.archive-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.archive-won {
  background: var(--success);
}

.archive-lost {
  background: var(--danger);
}

.archive-unplayed {
  background: var(--border);
}

.game-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.card {
  width: 380px;
  background: var(--card-bg);
  padding: 56px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: background 0.25s;
}

.day-label {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-bottom: 36px;
}

.logo-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 140px;
  margin-bottom: 28px;
}

#logo-svg {
  color: var(--text);
}

#logo-svg[data-status="won"] {
  color: var(--success);
}

#logo-svg[data-status="lost"] {
  color: var(--faint);
}

.guesses {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  width: 100%;
}

.guess-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 44px;
  border-radius: 6px;
  color: white;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  animation: revealTile 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.guess-correct {
  background: var(--success);
}

.guess-wrong {
  background: var(--danger);
}

.play-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-wrap {
  position: relative;
  width: 100%;
  margin-bottom: 16px;
}

.guess-input {
  width: 100%;
  height: 52px;
  border: 2px solid var(--text);
  border-radius: 6px;
  background: var(--card-bg);
  padding: 0 14px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-align: center;
  color: var(--text);
  outline: none;
  font-family: "Inter", sans-serif;
  box-shadow: 0 4px 0 var(--text);
  transform: translateY(0);
  transition: box-shadow 0.1s, transform 0.1s;
}

.guess-input:focus {
  box-shadow: 0 2px 0 var(--text);
  transform: translateY(2px);
}

.suggestions {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  background: var(--card-bg);
  border: 2px solid var(--text);
  border-radius: 6px;
  overflow: hidden;
  z-index: 2;
}

.suggestions:not([hidden]) {
  display: block;
}

.suggestion {
  padding: 10px 4px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--muted);
  cursor: pointer;
}

.suggestion:hover {
  background: var(--panel-bg);
}

.dots {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.dot {
  width: 32px;
  height: 8px;
  border-radius: 2px;
  background: var(--border);
}

.dot-used {
  background: var(--danger);
}

.hint {
  font-size: 12px;
  color: var(--muted);
}

.reveal:not([hidden]) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reveal-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
  animation: revealPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.reveal-fact {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 22px;
  line-height: 1.5;
  animation: revealFade 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.08s backwards;
}

.share-grid {
  display: flex;
  gap: 6px;
  margin-bottom: 22px;
  animation: revealFade 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.16s backwards;
}

.share-cell {
  width: 14px;
  height: 14px;
  border-radius: 2px;
}

.share-correct {
  background: var(--success);
}

.share-wrong {
  background: var(--danger);
}

.share-empty {
  background: var(--border);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 12px;
  color: var(--muted);
  animation: revealFade 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.22s backwards;
}

@keyframes revealPop {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(10px);
  }
  55% {
    opacity: 1;
    transform: scale(1.12) translateY(0);
  }
  75% {
    transform: scale(0.96);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes revealFade {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.92);
  }
  70% {
    opacity: 1;
    transform: translateY(0) scale(1.03);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes revealTile {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  65% {
    opacity: 1;
    transform: scale(1.15);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

- [ ] **Step 2: Replace the page shell**

```astro
---
// src/pages/index.astro
import '../styles/global.css';
---

<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
		<link rel="icon" href="/favicon.ico" />
		<meta name="viewport" content="width=device-width" />
		<meta name="generator" content={Astro.generator} />
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
		<title>Guess the Logo</title>
	</head>
	<body>
		<div class="page">
			<header class="header">
				<span class="title">Guess the Logo</span>
				<div class="header-actions">
					<button type="button" class="archive-toggle" id="archive-toggle">
						<span>Past days</span>
						<span class="archive-arrow" id="archive-arrow">▼</span>
					</button>
					<button type="button" class="dark-toggle" id="dark-toggle" aria-label="Toggle dark mode">
						<span class="dark-toggle-knob" id="dark-toggle-knob"></span>
					</button>
				</div>
			</header>

			<div class="archive-panel" id="archive-panel" hidden>
				<div class="archive-days" id="archive-days"></div>
			</div>

			<main class="game-area">
				<div class="card">
					<div class="day-label" id="day-label"></div>

					<div class="logo-wrap">
						<svg id="logo-svg" width="78" height="67" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>
					</div>

					<div class="guesses" id="guesses"></div>

					<div class="play-area" id="play-area">
						<div class="input-wrap">
							<input type="text" id="guess-input" class="guess-input" placeholder="TYPE A COMPANY NAME" autocomplete="off" />
							<div class="suggestions" id="suggestions" hidden></div>
						</div>
						<div class="dots" id="dots"></div>
						<div class="hint" id="hint"></div>
					</div>

					<div class="reveal" id="reveal" hidden>
						<div class="reveal-name" id="reveal-name"></div>
						<div class="reveal-fact" id="reveal-fact"></div>
						<div class="share-grid" id="share-grid"></div>
						<div class="meta-row">
							<span id="streak-text"></span>
							<span id="countdown-text"></span>
						</div>
					</div>
				</div>
			</main>
		</div>
	</body>
</html>
```

Note: no `<script>` tag yet — that's added in Task 3 once `game.js` exists, so this
step doesn't reference a file that doesn't exist yet.

- [ ] **Step 3: Manually verify the static shell**

Run: `astro dev --background`, then `astro dev logs` to confirm it started without
errors, then open `http://localhost:4321` in a browser.

Expected: header with "Guess the Logo" title, "Past days ▼" and a dark-mode pill
toggle (non-functional, that's expected — no JS yet); a centered card with an empty
logo area, no guess tiles, an empty input box with placeholder "TYPE A COMPANY NAME",
no dots, no hint text. No console errors about missing `game.js` (there's no script
tag yet). Run `astro dev stop` when done looking.

- [ ] **Step 4: Mark task complete**

No commit — leave the changes uncommitted (per Global Constraints).

---

### Task 3: Core game loop

**Files:**
- Create: `src/scripts/game.js`
- Modify: `src/pages/index.astro:` add a script tag before `</body>`

**Interfaces:**
- Consumes: `LOGOS` from `src/data/logos.js` (Task 1); the DOM element IDs from
  Task 2 (`day-label`, `logo-svg`, `guesses`, `play-area`, `guess-input`,
  `suggestions`, `dots`, `hint`, `reveal`, `reveal-name`, `reveal-fact`,
  `share-grid`).
- Produces: `export function dayIndexFor(date, epoch)`, `export function
  pickLogo(bank, dayIndex)`, `export function isCorrectGuess(text, logo)`,
  `export function suggestionsFor(value, bank, excludeName)`, and
  `export function initGame()` — the entry point Task 4 extends and the page calls.
  Also establishes the `logodle_today_v1` localStorage key holding
  `{ dayIndex: number, guesses: {text: string, correct: boolean}[], status: "playing"|"won"|"lost" }`,
  which Task 4 reads for streak computation.

- [ ] **Step 1: Create the game script**

```js
// src/scripts/game.js
import { LOGOS } from "../data/logos.js";

const EPOCH = new Date(2024, 0, 1);
const MAX_TRIES = 3;
const TODAY_KEY = "logodle_today_v1";

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

export function initGame() {
  const bank = LOGOS;
  const dayIndex = dayIndexFor(new Date());
  const logo = pickLogo(bank, dayIndex);
  const savedToday = loadJSON(TODAY_KEY, null);
  const resuming = savedToday && savedToday.dayIndex === dayIndex;

  const state = {
    dayIndex,
    logo,
    value: "",
    guesses: resuming ? savedToday.guesses : [],
    status: resuming ? savedToday.status : "playing",
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
  };

  function persistToday() {
    saveJSON(TODAY_KEY, { dayIndex: state.dayIndex, guesses: state.guesses, status: state.status });
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
    persistToday();
    render();
  }

  function render() {
    const isPlaying = state.status === "playing";
    const isOver = !isPlaying;
    const attemptCount = state.guesses.length;

    els.dayLabel.textContent = isOver
      ? `SOLVED — #${state.dayIndex + 1}`
      : `GUESS THE LOGO · #${state.dayIndex + 1}`;

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
    }
  }

  els.input.addEventListener("input", (e) => {
    state.value = e.target.value;
    render();
  });
  els.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitGuess(state.value);
  });

  render();
}
```

- [ ] **Step 2: Wire the script into the page**

In `src/pages/index.astro`, add this immediately before the closing `</body>` tag:

```astro
		<script>
			import { initGame } from "../scripts/game.js";
			initGame();
		</script>
	</body>
```

- [ ] **Step 3: Sanity-check the pure functions with a throwaway Node command**

Run:

```bash
node -e "
import('./src/scripts/game.js').then(({ dayIndexFor, pickLogo, isCorrectGuess, suggestionsFor }) => {
  const epoch = new Date(2024, 0, 1);
  console.log('epoch day index:', dayIndexFor(epoch, epoch));
  console.log('day after epoch:', dayIndexFor(new Date(2024, 0, 2), epoch));
  const bank = [
    { name: 'Vue.js', aliases: ['vue', 'vue.js', 'vuejs'] },
    { name: 'Netflix', aliases: ['netflix'] },
  ];
  console.log('pickLogo(0):', pickLogo(bank, 0).name);
  console.log('pickLogo(1):', pickLogo(bank, 1).name);
  console.log('pickLogo(2) wraps to 0:', pickLogo(bank, 2).name);
  console.log('isCorrectGuess vue:', isCorrectGuess(' Vue ', bank[0]));
  console.log('isCorrectGuess wrong:', isCorrectGuess('vuex', bank[0]));
  console.log('suggestionsFor ne:', suggestionsFor('ne', bank, null));
});
"
```

Expected: `epoch day index: 0`, `day after epoch: 1`, `pickLogo(0): Vue.js`,
`pickLogo(1): Netflix`, `pickLogo(2) wraps to 0: Vue.js`, `isCorrectGuess vue: true`,
`isCorrectGuess wrong: false`, `suggestionsFor ne: [ 'Netflix' ]`.

- [ ] **Step 4: Manually verify the full play loop in a browser**

Run: `astro dev --background`, then open `http://localhost:4321`.

Expected, in order:
1. The card shows a real logo (today's, based on your machine's local date), the
   day label reads `GUESS THE LOGO · #N`, 3 empty progress dots, and the hint
   "Wrong guess reveals a hint."
2. Typing a partial company name (e.g. "ne") shows a dropdown with matching
   suggestions from the full 16-logo bank; clicking one fills the input.
3. Pressing Enter with a wrong guess adds a red tile with your guessed text, fills
   one progress dot, and advances the hint (industry, then founding year).
4. On the 3rd wrong guess, the play area hides and the reveal section shows the
   correct name, fun fact, and a share grid with 3 red cells.
5. Reloading the page mid-game (after 1-2 wrong guesses, before finishing) restores
   the same guesses and hint state instead of resetting.
6. Open devtools console and run `localStorage.getItem('logodle_today_v1')` — it
   should show a JSON object with today's `dayIndex`, your `guesses`, and `status`.

Run `astro dev stop` when done.

- [ ] **Step 5: Mark task complete**

No commit — leave the changes uncommitted (per Global Constraints).

---

### Task 4: Dark mode, countdown, streak & archive

**Files:**
- Modify: `src/scripts/game.js` (full replacement, extending Task 3's version)

**Interfaces:**
- Consumes: everything from Task 3 (`dayIndexFor`, `pickLogo`, `isCorrectGuess`,
  `suggestionsFor`, the `logodle_today_v1` key, the `initGame` structure); the
  additional DOM element IDs from Task 2 (`streak-text`, `countdown-text`,
  `archive-toggle`, `archive-panel`, `archive-arrow`, `archive-days`,
  `dark-toggle`, `dark-toggle-knob`).
- Produces: `export function formatCountdown(ms)`, `export function
  nextLocalMidnight(from)`, `export function computeStreak(history, todayIndex)`.
  Adds the `logodle_dark_v1` (`"1"`/`"0"`) and `logodle_history_v1`
  (`{ [dayIndex: string]: "won" | "lost" }`) localStorage keys.

- [ ] **Step 1: Replace `src/scripts/game.js` with the extended version**

```js
// src/scripts/game.js
import { LOGOS } from "../data/logos.js";

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
  const dayIndex = dayIndexFor(new Date());
  const logo = pickLogo(bank, dayIndex);
  const savedToday = loadJSON(TODAY_KEY, null);
  const resuming = savedToday && savedToday.dayIndex === dayIndex;
  const history = loadJSON(HISTORY_KEY, {});

  const state = {
    dayIndex,
    logo,
    value: "",
    guesses: resuming ? savedToday.guesses : [],
    status: resuming ? savedToday.status : "playing",
    archiveOpen: false,
    dark: loadDark(),
    now: Date.now(),
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
    els.countdownText.textContent = `next in ${formatCountdown(nextLocalMidnight().getTime() - state.now)}`;
  }

  function render() {
    const isPlaying = state.status === "playing";
    const isOver = !isPlaying;
    const attemptCount = state.guesses.length;

    els.dayLabel.textContent = isOver
      ? `SOLVED — #${state.dayIndex + 1}`
      : `GUESS THE LOGO · #${state.dayIndex + 1}`;

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

  els.input.addEventListener("input", (e) => {
    state.value = e.target.value;
    render();
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

  setInterval(() => {
    state.now = Date.now();
    if (state.status !== "playing") {
      renderCountdownAndStreak();
    }
  }, 1000);

  applyTheme();
  render();
}
```

- [ ] **Step 2: Sanity-check the new pure functions with a throwaway Node command**

Run:

```bash
node -e "
import('./src/scripts/game.js').then(({ formatCountdown, computeStreak }) => {
  console.log('0ms:', formatCountdown(0));
  console.log('negative clamps to 0:', formatCountdown(-5000));
  console.log('3661000ms:', formatCountdown(3661000));
  const history = { '10': 'won', '9': 'won', '8': 'lost', '7': 'won' };
  console.log('streak ending on completed win day 10:', computeStreak(history, 10));
  console.log('streak when today (11) not yet played:', computeStreak(history, 11));
  console.log('streak broken by loss:', computeStreak({ '5': 'lost', '4': 'won' }, 5));
});
"
```

Expected: `0ms: 00:00:00`, `negative clamps to 0: 00:00:00`,
`3661000ms: 01:01:01`, `streak ending on completed win day 10: 2`,
`streak when today (11) not yet played: 2`, `streak broken by loss: 0`.

- [ ] **Step 3: Manually verify dark mode, countdown, streak and archive in a browser**

Run: `astro dev --background`, then open `http://localhost:4321`.

1. Click the dark-mode toggle — the whole page should switch to the dark palette
   immediately and the toggle knob should slide right. Reload the page — dark mode
   should still be on.
2. Finish a game (win or lose) — the "streak" and "next in HH:MM:SS" text should
   appear under the reveal, and the countdown should visibly tick down once per
   second.
3. Open devtools console and seed some fake history to test the archive before it
   has real data:
   ```js
   const idx = JSON.parse(localStorage.getItem('logodle_today_v1')).dayIndex;
   localStorage.setItem('logodle_history_v1', JSON.stringify({
     [idx - 1]: 'won', [idx - 2]: 'won', [idx - 3]: 'lost',
   }));
   ```
   Reload the page, click "Past days" — it should expand and show up to 5 rows
   (fewer if `idx` is small), with green "Solved" dots for `idx-1`/`idx-2`, a red
   "Missed" dot for `idx-3`, and faint "Not played" dots for the rest. Clicking a
   row should do nothing (read-only, as designed).
4. With that same seeded history, finish today's game with a win — the streak
   should read `3` (today plus the two prior wins), confirming `computeStreak`
   correctly picks up today's just-written result.

Run `astro dev stop` when done.

- [ ] **Step 4: Mark task complete**

No commit — leave the changes uncommitted (per Global Constraints).

---

### Task 5: End-to-end QA pass

**Files:** none (verification only).

**Interfaces:** none — this task only exercises what Tasks 1-4 built.

- [ ] **Step 1: Full production build**

Run: `astro build`

Expected: build succeeds with no errors or warnings about the new files.

- [ ] **Step 2: Preview the production build**

Run: `astro preview`, open the printed local URL.

Expected: identical behavior to the dev server — today's puzzle loads, guesses
work, dark mode and archive work, no console errors. Stop the preview server with
Ctrl+C when done.

- [ ] **Step 3: Cross-cutting edge cases in the dev server**

Run: `astro dev --background`, open `http://localhost:4321`, and check:

1. Clear all `logodle_*` keys from localStorage (devtools → Application → Local
   Storage) and reload — the game should start fresh at "playing" with 0 guesses,
   no errors.
2. Type a guess that matches multiple bank entries by prefix (e.g. "g") — the
   suggestion dropdown should cap at 4 entries, not show more.
3. Guess correctly on the first try — reveal should show immediately with a
   green tile and a share grid of 1 green cell + 2 empty cells.
4. Resize the browser to a narrow mobile width — header and archive strip should
   wrap (`flex-wrap: wrap` on `.archive-days`) rather than overflow horizontally.

Run `astro dev stop` when done.

- [ ] **Step 4: Mark task complete**

No commit — the user will review and commit this work themselves (per Global
Constraints).
