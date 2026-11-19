import { BRANDS } from "../brands";
import { buildAuthOptionsFragment } from "./auth-config";

const brandOrigins = Object.values(BRANDS).map((b) => b.origin);

describe("buildAuthOptionsFragment", () => {
  it("in production, trusts every brand origin and shares the cookie across .slogodle.com", () => {
    const fragment = buildAuthOptionsFragment(brandOrigins, false);

    expect(fragment.trustedOrigins).toEqual(brandOrigins);
    expect(fragment.trustedOrigins).toEqual(
      expect.arrayContaining([
        "https://tech.slogodle.com",
        "https://brand.slogodle.com",
      ]),
    );
    expect(fragment.advanced).toEqual({
      useSecureCookies: true,
      crossSubDomainCookies: { enabled: true, domain: ".slogodle.com" },
    });
  });

  it("in dev, keeps the cookie host-only but still trusts the brand origins", () => {
    const fragment = buildAuthOptionsFragment(brandOrigins, true);

    expect(fragment.advanced).toBeUndefined();
    expect(fragment).not.toHaveProperty("advanced");
    expect(fragment.trustedOrigins).toEqual(brandOrigins);
  });
});
