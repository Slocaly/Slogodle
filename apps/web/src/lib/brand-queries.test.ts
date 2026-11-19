import { beforeEach, describe, expect, it, vi } from "vitest";
import { claimAnon, myProgress } from "./progress.server";
import {
  getSpeedHistory,
  getSpeedLadder,
  getSpeedRun,
  startSpeedRun,
} from "./speed.server";
import { dayIndexFor } from "./game-logic";

const captured = vi.hoisted(() => ({ sql: [] as string[] }));

vi.mock("./brand-db.server", () => ({
  BRAND_ID: "tech",
  prepareScoped: (sql: string) => {
    captured.sql.push(sql);
    const statement = {
      all: async () => ({ results: [] }),
      bind: () => statement,
      first: async () => null,
      run: async () => ({}),
    };
    return statement;
  },
}));
vi.mock("cloudflare:workers", () => ({
  env: { DB: { batch: async () => [] } },
}));
vi.mock("@tanstack/react-start/server", () => ({
  getRequestHeaders: () => new Headers(),
}));
vi.mock("./auth.server", () => ({
  getAuth: () => ({
    api: { getSession: async () => ({ user: { id: "user-1" } }) },
  }),
}));
vi.mock("./game-logos.server", () => ({
  listGameLogos: async () => [],
  listGameLogosWithId: async () => [],
}));

describe("brand scope of progress and speed queries", () => {
  beforeEach(() => {
    captured.sql.length = 0;
  });

  it("scopes every claimAnon statement, including the deletes and updates", async () => {
    await claimAnon(new Headers(), "anon-1");
    expect(captured.sql).toHaveLength(4);
    for (const sql of captured.sql) expect(sql).toContain("brand = $BRAND");
  });

  it("scopes myProgress", async () => {
    await myProgress(new Headers());
    expect(captured.sql).toHaveLength(1);
    expect(captured.sql[0]).toContain("brand = $BRAND");
  });

  it("scopes speed run reads, inserts, ladder and history", async () => {
    const today = dayIndexFor(new Date());
    await startSpeedRun({ anonId: "a", dayIndex: today });
    await getSpeedRun({ anonId: "a", dayIndex: today });
    await getSpeedLadder({ anonId: "a", dayIndex: today });
    await getSpeedHistory({ anonId: "a" });
    expect(captured.sql.length).toBeGreaterThanOrEqual(4);
    for (const sql of captured.sql) expect(sql).toContain("$BRAND");
    const history = captured.sql.find((s) => s.includes("o.day_index"));
    expect(history).toContain("o.brand = $BRAND");
    expect(history).toContain("r.brand = $BRAND");
  });
});
