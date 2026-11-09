import { describe, expect, it } from "vitest";
import type { Logo } from "@slogodle/logos";
import {
  MAX_TRIES,
  buildShareText,
  computeBestStreak,
  computeStreak,
  dayIndexFor,
  formatCountdown,
  isCorrectGuess,
  nextLocalMidnight,
  pickLogo,
  resolveGuesses,
  rewardFor,
  suggestionsFor,
  type GameStatus,
} from "./game-logic";

const logo = { name: "React" } as Logo;

describe("dayIndexFor", () => {
  const epoch = new Date(2026, 0, 1);
  it("is 0 on the epoch day, whatever the time", () => {
    expect(dayIndexFor(new Date(2026, 0, 1, 23, 59), epoch)).toBe(0);
  });
  it("increments at local midnight", () => {
    expect(dayIndexFor(new Date(2026, 0, 2, 0, 0), epoch)).toBe(1);
    expect(dayIndexFor(new Date(2026, 0, 31), epoch)).toBe(30);
  });
  it("is negative before the epoch", () => {
    expect(dayIndexFor(new Date(2025, 11, 31), epoch)).toBe(-1);
  });
});

describe("pickLogo", () => {
  const bank = [{ name: "a" }, { name: "b" }, { name: "c" }] as Logo[];
  it("wraps around the bank", () => {
    expect(pickLogo(bank, 0).name).toBe("a");
    expect(pickLogo(bank, 4).name).toBe("b");
  });
  it("handles negative indexes", () => {
    expect(pickLogo(bank, -1).name).toBe("c");
  });
});

describe("isCorrectGuess", () => {
  it("ignores case and surrounding whitespace", () => {
    expect(isCorrectGuess("  rEaCt ", logo)).toBe(true);
  });
  it("rejects other text", () => {
    expect(isCorrectGuess("vue", logo)).toBe(false);
  });
});

describe("resolveGuesses", () => {
  it("is playing while under the limit with no correct guess", () => {
    expect(resolveGuesses(["a"], logo).status).toBe("playing");
  });
  it("wins and stops at the first correct guess", () => {
    const r = resolveGuesses(["a", "react", "b"], logo);
    expect(r.status).toBe("won");
    expect(r.guesses).toHaveLength(2);
  });
  it("loses after MAX_TRIES wrong guesses and ignores extras", () => {
    const r = resolveGuesses(["a", "b", "c", "react"], logo);
    expect(r.status).toBe("lost");
    expect(r.guesses).toHaveLength(MAX_TRIES);
  });
});

describe("rewardFor", () => {
  const one = [{ text: "react", correct: true }];
  it("is 0 unless won", () => {
    expect(rewardFor("lost", one, true)).toBe(0);
    expect(rewardFor("playing", one, true)).toBe(0);
  });
  it("rewards fewer guesses on a fresh day", () => {
    expect(rewardFor("won", one, true)).toBe(MAX_TRIES);
  });
  it("gives 1 for archive days", () => {
    expect(rewardFor("won", one, false)).toBe(1);
  });
});

describe("suggestionsFor", () => {
  const bank = [
    { name: "React" },
    { name: "Redux" },
    { name: "Vue" },
  ] as Logo[];
  it("returns nothing for blank input", () => {
    expect(suggestionsFor("  ", bank, null)).toEqual([]);
  });
  it("matches by case-insensitive prefix", () => {
    expect(suggestionsFor("re", bank, null).map((s) => s.value)).toEqual([
      "React",
      "Redux",
    ]);
  });
  it("excludes the given name", () => {
    expect(suggestionsFor("re", bank, "React").map((s) => s.value)).toEqual([
      "Redux",
    ]);
  });
});

describe("formatCountdown", () => {
  it("formats hh:mm:ss", () => {
    expect(formatCountdown(3_661_000)).toBe("01:01:01");
  });
  it("clamps negatives to zero", () => {
    expect(formatCountdown(-5000)).toBe("00:00:00");
  });
});

describe("nextLocalMidnight", () => {
  it("returns the start of the following day", () => {
    expect(nextLocalMidnight(new Date(2026, 5, 10, 15, 30)).getTime()).toBe(
      new Date(2026, 5, 11).getTime(),
    );
  });
});

describe("streaks", () => {
  const h = (o: Record<number, GameStatus>) =>
    Object.fromEntries(Object.entries(o)) as Record<string, GameStatus>;

  it("counts consecutive wins ending today", () => {
    expect(computeStreak(h({ 1: "won", 2: "won", 3: "won" }), 3)).toBe(3);
  });
  it("keeps the streak alive if today is not played yet", () => {
    expect(computeStreak(h({ 1: "won", 2: "won" }), 3)).toBe(2);
  });
  it("breaks on a loss", () => {
    expect(computeStreak(h({ 1: "won", 2: "lost", 3: "won" }), 3)).toBe(1);
  });
  it("finds the best streak over history", () => {
    const history = h({ 0: "won", 1: "won", 2: "won", 3: "lost", 4: "won" });
    expect(computeBestStreak(history, 4)).toBe(3);
  });
});

describe("buildShareText", () => {
  const base = {
    intro: "Slogodle",
    title: "Daily",
    dayIndex: 4,
    maxTries: 3,
    origin: "https://slogodle.test",
  };
  it("renders a win", () => {
    const text = buildShareText({
      ...base,
      guesses: [
        { text: "a", correct: false },
        { text: "react", correct: true },
      ],
      status: "won",
    });
    expect(text).toBe(
      "Slogodle\nDaily #5 2/3\n\n🟥🟩\n\nhttps://slogodle.test",
    );
  });
  it("renders a loss with a streak line", () => {
    const text = buildShareText({
      ...base,
      guesses: [{ text: "a", correct: false }],
      status: "lost",
      streakLine: "🔥 2",
    });
    expect(text).toContain("#5 X/3");
    expect(text).toContain("🔥 2\n\nhttps://slogodle.test");
  });
});
