import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fetchSpeedStanding } from "src/lib/speed-runs";
import { createTestingLogo } from "src/test/create-testing-logo";
import { mockAuthSession } from "src/test/mock-auth-session";
import { render } from "src/test/render-with-providers";
import { RevealPanel } from "../RevealPanel";

vi.setConfig({ restoreMocks: true });

// better-auth's useSession hook has no service underneath to cut at.
vi.mock("src/lib/auth-client", () => ({
  authClient: { useSession: vi.fn() },
}));
vi.mock("src/lib/speed-runs", () => ({
  fetchSpeedStanding: vi.fn(),
}));

const logo = createTestingLogo({
  description: "React is a UI library.",
  funFact: "React came out of a news feed.",
  gitLink: "https://github.com/facebook/react",
});

const renderRevealPanel = (
  props: Partial<React.ComponentProps<typeof RevealPanel>> = {},
) =>
  act(() =>
    render(
      <RevealPanel
        dayIndex={4}
        guesses={[
          { correct: false, text: "Vue" },
          { correct: true, text: "React" },
        ]}
        logo={logo}
        maxTries={3}
        playClick={vi.fn()}
        status="won"
        {...props}
      />,
    ),
  );

describe("RevealPanel", () => {
  beforeEach(() => {
    mockAuthSession("anonymous");
    vi.mocked(fetchSpeedStanding).mockResolvedValue(null);
  });

  it("shows the logo's description and fun fact", async () => {
    await renderRevealPanel();

    expect(screen.getByText("React is a UI library.")).toBeVisible();
    expect(screen.getByText("React came out of a news feed.")).toBeVisible();
  });

  it("links to the project's repository in a new tab", async () => {
    await renderRevealPanel();

    const link = screen.getByRole("link", { name: "Learn more" });

    expect(link).toHaveAttribute("href", "https://github.com/facebook/react");
    expect(link).toHaveAttribute("target", "_blank");
  });

  describe("sharing", () => {
    // userEvent.setup() installs its own in-memory clipboard on navigator.
    it("copies the result to the clipboard and confirms it", async () => {
      const user = userEvent.setup();
      await renderRevealPanel();

      await user.click(screen.getByRole("button", { name: "Share result" }));

      expect(
        await screen.findByRole("button", { name: "Copied!" }),
      ).toBeVisible();
      expect(await navigator.clipboard.readText()).toBe(
        `I found today's tech logo!\nSlogodle #5 2/3\n\n🟥🟩\n\n${window.location.origin}`,
      );
    });

    it("shares a loss with the lost intro and an X score", async () => {
      const user = userEvent.setup();
      await renderRevealPanel({
        guesses: [
          { correct: false, text: "a" },
          { correct: false, text: "b" },
          { correct: false, text: "c" },
        ],
        status: "lost",
      });

      await user.click(screen.getByRole("button", { name: "Share result" }));

      await screen.findByRole("button", { name: "Copied!" });
      expect(await navigator.clipboard.readText()).toBe(
        `I couldn't find today's tech logo...\nSlogodle #5 X/3\n\n🟥🟥🟥\n\n${window.location.origin}`,
      );
    });

    it("includes the streak when the player has one", async () => {
      const user = userEvent.setup();
      await renderRevealPanel({ streak: 6 });

      await user.click(screen.getByRole("button", { name: "Share result" }));

      await screen.findByRole("button", { name: "Copied!" });
      expect(await navigator.clipboard.readText()).toContain("🔥 6-day streak");
    });

    it("plays the click sound", async () => {
      const user = userEvent.setup();
      const playClick = vi.fn();
      await renderRevealPanel({ playClick });

      await user.click(screen.getByRole("button", { name: "Share result" }));

      expect(playClick).toHaveBeenCalledOnce();
      await screen.findByRole("button", { name: "Copied!" });
    });

    it("keeps the share button unchanged when the clipboard is unavailable", async () => {
      const user = userEvent.setup();
      const writeText = vi
        .spyOn(navigator.clipboard, "writeText")
        .mockRejectedValue(new Error("denied"));
      await renderRevealPanel();

      await user.click(screen.getByRole("button", { name: "Share result" }));

      await vi.waitFor(() => expect(writeText).toHaveBeenCalledOnce());
      expect(
        screen.getByRole("button", { name: "Share result" }),
      ).toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Copied!" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("sign-up call to action", () => {
    it("invites an anonymous player to sign up", async () => {
      mockAuthSession("anonymous");
      await renderRevealPanel();

      expect(
        screen.getByRole("link", { name: "Save your streak — sign up" }),
      ).toHaveAttribute("href", "/signup");
    });

    it("is hidden for a signed-in player", async () => {
      mockAuthSession({ user: { name: "Ada" } });
      await renderRevealPanel();

      expect(
        screen.queryByRole("link", { name: "Save your streak — sign up" }),
      ).not.toBeInTheDocument();
    });

    it("is hidden while the session is loading", async () => {
      mockAuthSession("pending");
      await renderRevealPanel();

      expect(
        screen.queryByRole("link", { name: "Save your streak — sign up" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("speed call to action", () => {
    it("promotes Speed mode to a player without a speed time today", async () => {
      await renderRevealPanel();

      expect(
        await screen.findByRole("link", {
          name: "Want more? Try Speed mode ⚡",
        }),
      ).toHaveAttribute("href", "/speed");
    });

    it("is hidden for a player who already finished today's Speed run", async () => {
      vi.mocked(fetchSpeedStanding).mockResolvedValue({
        rank: 2,
        scoreMs: 30_000,
      });
      await renderRevealPanel();

      await act(() => Promise.resolve());

      expect(
        screen.queryByRole("link", { name: "Want more? Try Speed mode ⚡" }),
      ).not.toBeInTheDocument();
    });

    it("is hidden until the standing is known", async () => {
      vi.mocked(fetchSpeedStanding).mockReturnValue(new Promise(() => {}));
      await renderRevealPanel();

      expect(
        screen.queryByRole("link", { name: "Want more? Try Speed mode ⚡" }),
      ).not.toBeInTheDocument();
    });
  });
});
