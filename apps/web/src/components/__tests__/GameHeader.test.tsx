import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fetchIsAdmin } from "src/lib/session";
import { fetchSpeedStanding } from "src/lib/speed-runs";
import { mockAuthSession } from "src/test/mock-auth-session";
import { render } from "src/test/render-with-providers";
import { GameHeader } from "../GameHeader";

vi.setConfig({ restoreMocks: true });

// better-auth's hooks have no service underneath to cut at.
vi.mock("src/lib/auth-client", () => ({
  authClient: { signOut: vi.fn(), useSession: vi.fn() },
}));
vi.mock("src/lib/session", () => ({
  fetchIsAdmin: vi.fn(),
}));
vi.mock("src/lib/speed-runs", () => ({
  fetchSpeedStanding: vi.fn(),
}));

const renderGameHeader = async (
  props: Partial<React.ComponentProps<typeof GameHeader>> = {},
  path = "/",
) => {
  const callbacks = {
    onToggleDark: vi.fn(),
    onToggleSound: vi.fn(),
    playBubble: vi.fn(),
    playClick: vi.fn(),
  };
  const rendered = await act(() =>
    render(<GameHeader dark={false} soundEnabled {...callbacks} {...props} />, {
      path,
    }),
  );
  return { ...rendered, ...callbacks };
};

describe("GameHeader", () => {
  beforeEach(() => {
    localStorage.setItem("slogodle_speed_seen_v1", "1");
    mockAuthSession("anonymous");
    vi.mocked(fetchIsAdmin).mockResolvedValue(false);
    vi.mocked(fetchSpeedStanding).mockResolvedValue(null);
  });

  it("shows the site title as the page heading", async () => {
    await renderGameHeader();

    expect(screen.getByRole("heading", { level: 1 })).toBeVisible();
    expect(screen.getByRole("button", { name: "Slogodle" })).toBeVisible();
  });

  describe("toggles", () => {
    it("toggles the sound and plays the click sound", async () => {
      const user = userEvent.setup();
      const { onToggleSound, playClick } = await renderGameHeader({
        soundEnabled: true,
      });

      await user.click(screen.getByRole("button", { name: "Turn sound off" }));

      expect(onToggleSound).toHaveBeenCalledOnce();
      expect(playClick).toHaveBeenCalledOnce();
    });

    it("toggles dark mode and plays the click sound", async () => {
      const user = userEvent.setup();
      const { onToggleDark, playClick } = await renderGameHeader({
        dark: false,
      });

      await user.click(
        screen.getByRole("button", { name: "Switch to dark mode" }),
      );

      expect(onToggleDark).toHaveBeenCalledOnce();
      expect(playClick).toHaveBeenCalledOnce();
    });
  });

  describe("history entry", () => {
    it("is absent when no history behavior is given", async () => {
      await renderGameHeader();

      expect(
        screen.queryByRole("button", { name: "History" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "History" }),
      ).not.toBeInTheDocument();
    });

    it("toggles the archive and plays the click sound", async () => {
      const user = userEvent.setup();
      const onToggleArchive = vi.fn();
      const { playClick } = await renderGameHeader({ onToggleArchive });

      await user.click(screen.getByRole("button", { name: "History" }));

      expect(onToggleArchive).toHaveBeenCalledOnce();
      expect(playClick).toHaveBeenCalledOnce();
    });

    it("links to the history page when given a destination", async () => {
      await renderGameHeader({ historyLinkTo: "/speed/history" }, "/speed");

      expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
        "href",
        "/speed/history",
      );
    });
  });

  describe("stats entry", () => {
    it("is absent when no destination is given", async () => {
      await renderGameHeader();

      expect(
        screen.queryByRole("link", { name: "View stats" }),
      ).not.toBeInTheDocument();
    });

    it("links to the stats", async () => {
      await renderGameHeader({ statsLinkTo: "/stats" });

      expect(screen.getByRole("link", { name: "View stats" })).toHaveAttribute(
        "href",
        "/stats",
      );
    });

    it("shows the streak when there is one", async () => {
      await renderGameHeader({ statsLinkTo: "/stats", streak: 9 });

      expect(screen.getByRole("link", { name: /Streak/ })).toHaveTextContent(
        "Streak9",
      );
    });
  });

  describe("title", () => {
    it("plays one rising bubble per title letter when activated", async () => {
      const user = userEvent.setup();
      const { playBubble } = await renderGameHeader();

      await user.click(screen.getByRole("button", { name: "Slogodle" }));

      // Bubbles are staggered over ~700ms in real time.
      await vi.waitFor(
        () => expect(playBubble).toHaveBeenCalledTimes("Slogodle".length),
        {
          timeout: 2000,
        },
      );
      const rates = playBubble.mock.calls.map(
        ([options]) => options.playbackRate,
      );
      rates.forEach((rate, i) => expect(rate).toBeCloseTo(1 + i * 0.1));
    });
  });
});
