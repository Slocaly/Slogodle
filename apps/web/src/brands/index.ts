export interface Brand {
  id: string;
  name: string;
  origin: string;
  epoch: [year: number, monthIndex: number, day: number];
  themeColor: string;
  requiresGitLink: boolean;
  // Replaces the hard-coded "tech" in "I found today's tech logo!".
  shareNoun: string;
  // White-outlined logos in the pile. They are data: URLs, so this also allows
  // data: images in the CSP (src/lib/csp.ts).
  stickerLogos: boolean;
}

export const BRANDS: Record<string, Brand> = {
  tech: {
    id: "tech",
    name: "Slogodle",
    origin: "https://tech.slogodle.com",
    epoch: [2026, 9, 5],
    themeColor: "#f4a6c6",
    requiresGitLink: true,
    shareNoun: "tech",
    stickerLogos: false,
  },
  // Placeholder: the owner fills in the real name/colors later.
  brand: {
    id: "brand",
    name: "Slogodle",
    origin: "https://brand.slogodle.com",
    epoch: [2026, 10, 19],
    themeColor: "#f4a6c6",
    requiresGitLink: false,
    shareNoun: "brand",
    stickerLogos: true,
  },
};

export function getBrand(id: string | undefined = "tech"): Brand {
  const found = Object.hasOwn(BRANDS, id) ? BRANDS[id] : undefined;
  if (!found) {
    throw new Error(
      `Unknown VARIANT "${id}" (expected one of: ${Object.keys(BRANDS).join(", ")})`,
    );
  }
  return found;
}

// `typeof` guard: vite.config.ts also imports this module (to fail the build on an
// unknown VARIANT) before `define` has injected the global.
export const brand: Brand = getBrand(
  typeof __VARIANT__ === "undefined" ? undefined : __VARIANT__,
);
