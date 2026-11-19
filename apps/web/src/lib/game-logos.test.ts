import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as BrandDb from "./brand-db.server";
import { buildCompleteLogosSql, listGameLogos } from "./game-logos.server";
import {
  deleteLogoMetadata,
  listLogoMetadata,
  reorderLogoMetadata,
  upsertLogoMetadata,
} from "./logo-metadata.server";

const captured = vi.hoisted(() => ({ batches: 0, sql: [] as string[] }));

vi.mock("./brand-db.server", async (importOriginal) => {
  const actual = await importOriginal<typeof BrandDb>();
  return {
    BRAND_ID: "tech",
    prepareScoped: (sql: string) => {
      // Resolve the scope as the real helper would for the tech build.
      captured.sql.push(actual.brandSql(sql, "tech"));
      const statement = {
        all: async () => ({ results: [] }),
        bind: () => statement,
        first: async () => ({ id: 1, r2_key: "k" }),
        run: async () => ({}),
      };
      return statement;
    },
  };
});
vi.mock("cloudflare:workers", () => ({
  env: {
    DB: {
      batch: async () => {
        captured.batches += 1;
        return [];
      },
    },
  },
}));

describe("brand scope of logo queries", () => {
  beforeEach(() => {
    captured.sql.length = 0;
    captured.batches = 0;
  });

  it("requires a git link and scopes the bank to the tech brand", async () => {
    await listGameLogos();
    expect(captured.sql).toHaveLength(1);
    expect(captured.sql[0]).toContain("git_link IS NOT NULL");
    expect(captured.sql[0]).toContain("brand = 'tech'");
  });

  it("drops the git link requirement for a brand that doesn't need one", () => {
    const sql = buildCompleteLogosSql(false);
    expect(sql).not.toContain("git_link IS NOT NULL");
    expect(sql).toContain("brand = $BRAND");
    expect(buildCompleteLogosSql(true)).toContain("git_link IS NOT NULL");
  });

  it("scopes the admin metadata listing", async () => {
    await listLogoMetadata();
    expect(captured.sql).toEqual([
      expect.stringContaining("WHERE brand = 'tech'"),
    ]);
  });

  it("upserts per brand, numbering day_order over this brand's rows only", async () => {
    await upsertLogoMetadata({
      aspect: 1,
      description: null,
      founded: null,
      funFact: null,
      gitLink: null,
      industry: null,
      name: null,
      r2Key: "k",
    });
    const [sql] = captured.sql;
    expect(sql).toMatch(/INSERT INTO logo_metadata \(brand, r2_key/);
    expect(sql).toMatch(/VALUES \('tech', \?/);
    expect(sql).toMatch(
      /SELECT COALESCE\(MAX\(day_order\), 0\) \+ 1 FROM logo_metadata WHERE brand = 'tech'/,
    );
    expect(sql).toContain("ON CONFLICT(brand, r2_key)");
  });

  it("scopes deletes and both reorder passes", async () => {
    await deleteLogoMetadata("k");
    await reorderLogoMetadata([
      { dayOrder: 1, r2Key: "a" },
      { dayOrder: 2, r2Key: "b" },
    ]);
    expect(captured.sql).toHaveLength(5);
    for (const sql of captured.sql) expect(sql).toContain("brand = 'tech'");
    expect(captured.batches).toBe(1);
  });
});
