import { describe, expect, it } from "vitest";
import { BRANDS } from "../brands";
import { buildCsp } from "./csp";

const directives = (csp: string) => csp.split("; ");

describe("buildCsp", () => {
  it("keeps the tech policy unchanged", () => {
    expect(buildCsp(BRANDS.tech)).toBe(
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; "),
    );
  });

  it("allows data: images for a brand with sticker logos", () => {
    expect(directives(buildCsp(BRANDS.brand))).toContain(
      "img-src 'self' data:",
    );
  });

  it("changes only img-src between the two brands", () => {
    const withoutImgSrc = (csp: string) =>
      directives(csp).filter((directive) => !directive.startsWith("img-src "));

    expect(withoutImgSrc(buildCsp(BRANDS.brand))).toEqual(
      withoutImgSrc(buildCsp(BRANDS.tech)),
    );
  });
});
