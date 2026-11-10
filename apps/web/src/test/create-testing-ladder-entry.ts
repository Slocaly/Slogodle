import type { LadderEntry } from "src/lib/speed-runs";

export function createTestingLadderEntry(
  overrides: Partial<LadderEntry> = {},
): LadderEntry {
  return {
    durationMs: 12_300,
    isMe: false,
    name: "Anon #4F2A",
    scoreMs: 12_300,
    wrongCount: 0,
    ...overrides,
  };
}
