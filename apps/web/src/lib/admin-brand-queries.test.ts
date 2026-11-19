import { beforeEach, describe, expect, it, vi } from "vitest";
import { dailyFinishStats } from "./stats.server";
import { topMistakesByLogo } from "./mistakes.server";
import { getAdminUserCounts, listAdminUsers } from "./users.server";

const captured = vi.hoisted(() => ({ sql: [] as string[] }));

vi.mock("./brand-db.server", () => ({
  BRAND_ID: "tech",
  prepareScoped: (sql: string) => {
    captured.sql.push(sql);
    const statement = {
      all: async () => ({ results: [] }),
      bind: () => statement,
      first: async () => null,
    };
    return statement;
  },
}));
vi.mock("./game-logos.server", () => ({
  listGameLogosWithId: async () => [
    { icon: "", id: 1, name: "Logo" },
  ],
}));

describe("brand scope of stats, mistakes and admin users", () => {
  beforeEach(() => {
    captured.sql.length = 0;
  });

  it("scopes dailyFinishStats", async () => {
    await dailyFinishStats(2026, 0);
    expect(captured.sql).toHaveLength(1);
    expect(captured.sql[0]).toContain("brand = $BRAND");
  });

  it("scopes topMistakesByLogo", async () => {
    await topMistakesByLogo();
    expect(captured.sql).toHaveLength(1);
    expect(captured.sql[0]).toContain("brand = $BRAND");
  });

  it("scopes the progress subquery of listAdminUsers but lists all users", async () => {
    await listAdminUsers();
    const sql = String(captured.sql[0]);
    const progress = sql.slice(sql.indexOf("FROM progress"));
    expect(progress.split("GROUP BY")[0]).toContain("brand = $BRAND");
    expect(sql.match(/brand = \$BRAND/g)).toHaveLength(1);
    expect(sql).not.toMatch(/FROM user u\s+WHERE/);
    const session = sql.slice(sql.indexOf("FROM session"));
    expect(session.split("GROUP BY")[0]).not.toContain("brand");
  });

  it("only brand-filters the anonymous count in getAdminUserCounts", async () => {
    await getAdminUserCounts();
    const sql = String(captured.sql[0]);
    const registered = sql.slice(sql.indexOf("FROM user"), sql.indexOf("AS registered"));
    expect(registered).not.toContain("brand");
    const anonymous = sql.slice(sql.indexOf("FROM progress"));
    expect(anonymous).toContain("brand = $BRAND");
  });
});
