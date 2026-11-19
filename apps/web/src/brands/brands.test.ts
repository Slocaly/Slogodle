import { describe, expect, it } from "vitest";
import { BRANDS, getBrand } from "./index";

describe("getBrand", () => {
  it("defaults to tech when undefined", () => {
    expect(getBrand().id).toBe("tech");
  });

  it("returns the brand entry", () => {
    expect(getBrand("brand").id).toBe("brand");
  });

  it("throws on an unknown variant", () => {
    expect(() => getBrand("nope")).toThrow(/Unknown VARIANT "nope"/);
  });
});

describe("BRANDS", () => {
  it("has the tech values", () => {
    expect(BRANDS.tech.origin).toBe("https://tech.slogodle.com");
    expect(BRANDS.tech.epoch).toEqual([2026, 9, 5]);
    expect(BRANDS.tech.themeColor).toBe("#f4a6c6");
    expect(BRANDS.tech.requiresGitLink).toBe(true);
  });

  it("has the brand values", () => {
    expect(BRANDS.brand.requiresGitLink).toBe(false);
    expect(BRANDS.brand.origin).toBe("https://brand.slogodle.com");
  });
});
