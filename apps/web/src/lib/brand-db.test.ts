import { describe, expect, it } from "vitest";
import { brand } from "../brands";
// "cloudflare:workers" resolves to an empty stub in vitest.config.ts; brandSql is
// pure and never touches `env`.
import { BRAND_ID, brandSql } from "./brand-db.server";

describe("brandSql", () => {
  it("replaces the $BRAND token with the quoted brand id", () => {
    expect(brandSql("SELECT 1 WHERE brand = $BRAND", "tech")).toBe(
      "SELECT 1 WHERE brand = 'tech'",
    );
  });

  it("replaces every $BRAND token", () => {
    expect(
      brandSql(
        "INSERT INTO t (brand) SELECT $BRAND WHERE NOT EXISTS (SELECT 1 FROM t WHERE brand = $BRAND)",
        "brand",
      ),
    ).toBe(
      "INSERT INTO t (brand) SELECT 'brand' WHERE NOT EXISTS (SELECT 1 FROM t WHERE brand = 'brand')",
    );
  });

  it("throws when the $BRAND scope is missing", () => {
    expect(() => brandSql("SELECT * FROM progress", "tech")).toThrow(/\$BRAND/);
  });

  it("throws on a brand id that isn't a plain slug", () => {
    expect(() => brandSql("SELECT 1 WHERE brand = $BRAND", "x'; DROP")).toThrow(
      /invalid brand id/,
    );
  });

  it("defaults to the build's brand", () => {
    expect(BRAND_ID).toBe(brand.id);
    expect(brandSql("WHERE brand = $BRAND")).toBe(
      `WHERE brand = '${brand.id}'`,
    );
  });
});

// Source-scan guard: game tables (progress, speed_run, logo_metadata) must only be
// queried through prepareScoped. Each task that converts a module appends it to
// MODULES; ALLOWLIST lists the raw env.DB.prepare calls that are allowed to stay
// (statements on user/session only), as file + snippet of the SQL that follows.
const MODULES: string[] = [];

const ALLOWLIST: { file: string; snippet: string }[] = [];

const RAW_PREPARE = "env.DB.prepare(";

// Raw source of the server modules, keyed by file name ("progress.server.ts").
const SOURCES: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("./*.server.ts", {
      eager: true,
      import: "default",
      query: "?raw",
    }),
  ).map(([path, source]) => [path.slice(2), source]),
);

function findUnscopedPrepares(file: string, source: string): string[] {
  const offenders: string[] = [];
  let index = source.indexOf(RAW_PREPARE);
  while (index !== -1) {
    // Match the snippet against the statement text right after the call.
    const start = index;
    const allowed = ALLOWLIST.some(
      (entry) =>
        entry.file === file &&
        source.slice(start, start + 400).includes(entry.snippet),
    );
    if (!allowed) {
      offenders.push(file);
    }
    index = source.indexOf(RAW_PREPARE, index + RAW_PREPARE.length);
  }
  return offenders;
}

describe("brand scope guard", () => {
  it("flags a raw env.DB.prepare call in a scanned module", () => {
    expect(
      findUnscopedPrepares(
        "fake.server.ts",
        'env.DB.prepare("SELECT * FROM progress")',
      ),
    ).toEqual(["fake.server.ts"]);
    expect(
      findUnscopedPrepares(
        "fake.server.ts",
        'prepareScoped("SELECT 1 WHERE brand = $BRAND")',
      ),
    ).toEqual([]);
  });

  it("can read the server modules it scans", () => {
    expect(SOURCES["brand-db.server.ts"]).toContain(
      "export function prepareScoped",
    );
  });

  it("converted modules only query game tables through prepareScoped", () => {
    for (const file of MODULES) {
      const source = SOURCES[file];
      expect(
        source,
        `${file} not found next to brand-db.test.ts`,
      ).toBeDefined();
      const offenders = findUnscopedPrepares(file, String(source));
      expect(offenders, `unscoped env.DB.prepare in ${file}`).toEqual([]);
    }
  });
});
