import { act } from "@testing-library/react";
import { createTestingLogo } from "src/test/create-testing-logo";
import { render } from "src/test/render-with-providers";

const mocks = vi.hoisted(() => ({
  brand: { stickerLogos: false },
  getStickerIconSrc: vi.fn(),
}));

vi.mock("../../brands", () => ({ brand: mocks.brand }));

// Canvas drawing, which happy-dom does not implement.
vi.mock("../../lib/stickerIcons", () => ({
  getStickerIconSrc: mocks.getStickerIconSrc,
}));

// The matter-js simulation needs real layout.
vi.mock("../../lib/physicsLogoPile", () => ({
  createLogoPileSimulation: () => ({
    destroy: vi.fn(),
    launchFromSide: vi.fn(),
    removeAllExcept: vi.fn(),
    setGravity: vi.fn(),
  }),
}));

const logo = createTestingLogo({ icon: "/logos/react.svg" });
const STICKER_SRC = "data:image/png;base64,c3RpY2tlcg==";

// The component reads its flag when the module loads, so each scenario sets the
// brand and the variable first, then imports a fresh copy.
async function renderPile(stickerLogos: boolean, variable: string | undefined) {
  mocks.brand.stickerLogos = stickerLogos;
  vi.stubEnv("VITE_STICKER_LOGOS", variable);
  vi.resetModules();
  const { PhysicsLogoPile } = await import("../PhysicsLogoPile");

  const view = await act(() =>
    render(
      <PhysicsLogoPile
        bank={[logo]}
        foundLogos={[{ count: 1, dayIndex: 0, logo }]}
        logo={logo}
      />,
    ),
  );
  // Lets the sticker promise swap the image source.
  await act(async () => {});
  // Decorative image (empty alt, aria-hidden pile): no role or text to query.
  return view.container.querySelector("img");
}

describe("PhysicsLogoPile", () => {
  beforeEach(() => {
    mocks.getStickerIconSrc.mockReset().mockResolvedValue(STICKER_SRC);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([undefined, "true"])(
    "shows sticker logos for a brand that has them (variable: %s)",
    async (variable) => {
      const img = await renderPile(true, variable);

      expect(img).toHaveAttribute("src", STICKER_SRC);
    },
  );

  it("shows plain logos when the variable switches stickers off", async () => {
    const img = await renderPile(true, "false");

    expect(img).toHaveAttribute("src", "/logos/react.svg");
    expect(mocks.getStickerIconSrc).not.toHaveBeenCalled();
  });

  it.each([undefined, "true", "false"])(
    "shows plain logos for a brand without stickers (variable: %s)",
    async (variable) => {
      const img = await renderPile(false, variable);

      expect(img).toHaveAttribute("src", "/logos/react.svg");
      expect(mocks.getStickerIconSrc).not.toHaveBeenCalled();
    },
  );
});
