interface Guess {
  t: string;
  ok: boolean;
}

interface Hint {
  label: string;
  text: string;
}

export interface Frame {
  /** How-to-play step highlighted during this frame (1-3) */
  step: number;
  /** Duration of the frame in ms */
  hold: number;
  win: boolean;
  typed: string;
  guesses: Guess[];
  hints: Hint[];
  won: boolean;
}

const HINTS: Hint[] = [
  { label: "Hint n°1", text: "Founded: 2026" },
  { label: "Hint n°2", text: "Industry: Games" },
];

const GUESSES: Guess[] = [
  { t: "Stripe", ok: false },
  { t: "Wordle", ok: false },
  { t: "Slogodle", ok: true },
];

/** Scripted round: type two wrong guesses letter by letter, then the right one */
export function buildFrames(): Frame[] {
  const raw: { typed: string; gs: Guess[]; step: number; hold: number; win?: boolean }[] = [];
  raw.push({ typed: "", gs: [], step: 1, hold: 1600 });
  GUESSES.forEach((g, gi) => {
    const done = GUESSES.slice(0, gi);
    const step = gi === 0 ? 1 : 2;
    for (let c = 1; c <= g.t.length; c++) raw.push({ typed: g.t.slice(0, c), gs: done, step, hold: 95 });
    raw.push({ typed: g.t, gs: done, step, hold: 500 });
    raw.push({
      typed: "",
      gs: GUESSES.slice(0, gi + 1),
      step: g.ok ? 3 : 2,
      hold: g.ok ? 4600 : 1900,
      win: g.ok,
    });
  });

  return raw.map((f) => ({
    step: f.step,
    hold: f.hold,
    win: !!f.win,
    typed: f.typed,
    guesses: f.gs,
    hints: HINTS.slice(0, f.gs.filter((g) => !g.ok).length),
    won: f.gs.some((g) => g.ok),
  }));
}

/** Render a frame into a GameCard element */
export function renderCard(card: HTMLElement, f: Frame) {
  card.toggleAttribute("data-won", f.won);

  const input = card.querySelector<HTMLElement>("[data-input]")!;
  input.toggleAttribute("data-has-typed", f.typed.length > 0);
  card.querySelector("[data-typed]")!.textContent = f.typed;

  card.querySelectorAll<HTMLElement>("[data-dot]").forEach((dot, k) => {
    const g = f.guesses[k];
    if (g) {
      dot.dataset.state = g.ok ? "correct" : "wrong";
      dot.title = g.t;
    } else {
      delete dot.dataset.state;
      dot.removeAttribute("title");
    }
  });

  card.querySelector<HTMLElement>("[data-prompt]")!.hidden = f.hints.length > 0;

  const hints = card.querySelector<HTMLElement>("[data-hints]")!;
  if (hints.childElementCount !== f.hints.length) {
    const tpl = card.querySelector<HTMLTemplateElement>("[data-hint-template]")!;
    hints.replaceChildren(
      ...f.hints.map((h) => {
        const node = tpl.content.cloneNode(true) as DocumentFragment;
        node.querySelector(".hint-label")!.textContent = h.label;
        node.querySelector(".hint-text")!.textContent = h.text;
        return node;
      }),
    );
  }
}

/** Time left until local midnight, as HH:MM:SS */
export function countdownToMidnight(now = new Date()) {
  const mid = new Date(now);
  mid.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((mid.getTime() - now.getTime()) / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
