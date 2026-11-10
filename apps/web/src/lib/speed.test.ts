import { describe, expect, it } from "vitest";
import type { Logo } from "@slogodle/logos";
import {
  SPEED_MISS_PENALTY_MS,
  SPEED_ROUND_SIZE,
  checkSpeedGuesses,
  dailySpeedLogos,
  formatTime,
  isCorrectSpeedGuess,
  normalizeAnswer,
  randomSpeedLogos,
  shuffle,
  speedScore,
} from "./speed";

const bank = Array.from({ length: 20 }, (_, i) => ({
  name: `Logo${i}`,
})) as Logo[];

describe("normalizeAnswer", () => {
  it("drops case, hyphens, dots and spaces", () => {
    expect(normalizeAnswer("React-Router")).toBe("reactrouter");
    expect(normalizeAnswer("Next.js")).toBe("nextjs");
    expect(normalizeAnswer("  a b ")).toBe("ab");
  });
});

describe("isCorrectSpeedGuess", () => {
  it.each([
    ["react router", "React Router"],
    ["Next", "Next.js"],
    ["nextjs", "Next.js"],
    ["solid", "SolidJS"],
    ["chakra", "Chakra UI"],
    ["shadcn", "shadcn/ui"],
    ["post", "PostCSS"],
    ["mongo", "MongoDB"],
  ])("accepts %j for %j", (guess, name) => {
    expect(isCorrectSpeedGuess(guess, name)).toBe(true);
  });

  it("does not strip a trailing 'ts' without a dot", () => {
    expect(isCorrectSpeedGuess("highchar", "Highcharts")).toBe(false);
    expect(isCorrectSpeedGuess("highcharts", "Highcharts")).toBe(true);
  });
  it("rejects wrong answers", () => {
    expect(isCorrectSpeedGuess("vue", "React")).toBe(false);
  });
});

describe("formatTime", () => {
  it("formats mm:ss.t", () => {
    expect(formatTime(0)).toBe("00:00.0");
    expect(formatTime(65_400)).toBe("01:05.4");
  });
});

describe("shuffle", () => {
  it("keeps the same items without mutating the input", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect([...out].sort((a, b) => a - b)).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
  it("is deterministic for a given random source", () => {
    expect(shuffle([1, 2, 3, 4], () => 0)).toEqual(
      shuffle([1, 2, 3, 4], () => 0),
    );
  });
});

describe("series", () => {
  it("random series has the round size with unique logos", () => {
    const s = randomSpeedLogos(bank);
    expect(s).toHaveLength(SPEED_ROUND_SIZE);
    expect(new Set(s).size).toBe(SPEED_ROUND_SIZE);
  });
  it("daily series is stable per day and varies across days", () => {
    expect(dailySpeedLogos(bank, 7)).toEqual(dailySpeedLogos(bank, 7));
    expect(dailySpeedLogos(bank, 7)).not.toEqual(dailySpeedLogos(bank, 8));
  });
});

describe("speedScore", () => {
  it("adds the miss penalty", () => {
    expect(speedScore(10_000, 3)).toEqual({
      durationMs: 10_000,
      wrongCount: 3,
      scoreMs: 10_000 + 3 * SPEED_MISS_PENALTY_MS,
    });
  });
});

describe("checkSpeedGuesses", () => {
  const logos = [{ name: "React" }, { name: "Vue" }] as Logo[];

  it("returns misses per logo for valid guesses", () => {
    expect(checkSpeedGuesses(logos, [["x", "y", "react"], ["vue"]])).toEqual([
      2, 0,
    ]);
  });
  it("rejects a non-array or wrong length", () => {
    expect(checkSpeedGuesses(logos, "nope")).toBeNull();
    expect(checkSpeedGuesses(logos, [["react"]])).toBeNull();
  });
  it("rejects lists not ending on the first correct guess", () => {
    expect(checkSpeedGuesses(logos, [["react", "x"], ["vue"]])).toBeNull();
    expect(checkSpeedGuesses(logos, [["x"], ["vue"]])).toBeNull();
  });
  it("rejects empty lists, non-strings and oversized guesses", () => {
    expect(checkSpeedGuesses(logos, [[], ["vue"]])).toBeNull();
    expect(checkSpeedGuesses(logos, [[1], ["vue"]])).toBeNull();
    expect(
      checkSpeedGuesses(logos, [["a".repeat(101), "react"], ["vue"]]),
    ).toBeNull();
  });
});
