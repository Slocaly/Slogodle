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

  setInterval(() => {
    state.now = Date.now();
    if (state.status !== "playing") {
      renderCountdownAndStreak();
    }
  }, 1000);

  applyTheme();
  render();
}
