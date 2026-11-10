import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fetchSpeedStanding } from "src/lib/speed-runs";
import { render } from "src/test/render-with-providers";
import { GameModeCards } from "../GameModeCards";

vi.setConfig({ restoreMocks: true });

vi.mock("src/lib/speed-runs", () => ({
  fetchSpeedStanding: vi.fn(),
}));

const SPEED_SEEN_KEY = "slogodle_speed_seen_v1";

const renderGameModeCards = (
  path: string,
  props: React.ComponentProps<typeof GameModeCards> = {},
) => act(() => render(<GameModeCards {...props} />, { path }));

describe("GameModeCards", () => {
  beforeEach(() => {
    localStorage.setItem(SPEED_SEEN_KEY, "1");
    vi.mocked(fetchSpeedStanding).mockResolvedValue(null);
  });

  it.each(["/stats", "/history", "/login"])("is hidden on %s", async (path) => {
    await renderGameModeCards(path);

    expect(
      screen.queryByRole("link", { name: /Daily/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Speed/ }),
    ).not.toBeInTheDocument();
  });

  it("marks Daily as the current page on the daily page", async () => {
    await renderGameModeCards("/");

    expect(screen.getByRole("link", { name: /Daily/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Speed/ })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks Speed as the current page on the speed page", async () => {
    await renderGameModeCards("/speed");

    expect(screen.getByRole("link", { name: /Speed/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Daily/ })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("describes the daily mode when no streak is given", async () => {
    await renderGameModeCards("/");

    expect(screen.getByRole("link", { name: /Daily/ })).toHaveTextContent(
      "Guess today's logo",
    );
  });

  it("shows the streak on the daily card when given", async () => {
    await renderGameModeCards("/", { streak: 4 });

    expect(screen.getByRole("link", { name: /Daily/ })).toHaveTextContent("4");
    expect(screen.getByRole("link", { name: /Daily/ })).not.toHaveTextContent(
      "Guess today's logo",
    );
  });

  it("invites the player to play Speed when they have no time yet", async () => {
    await renderGameModeCards("/");

    expect(
      await screen.findByRole("link", { name: /Speed/ }),
    ).toHaveTextContent("Today's series · Play");
  });

  it("shows the player's rank and time on the speed card once they have finished", async () => {
    vi.mocked(fetchSpeedStanding).mockResolvedValue({
      rank: 3,
      scoreMs: 65_400,
    });
    await renderGameModeCards("/");

    expect(await screen.findByText("#3")).toBeVisible();
    expect(screen.getByRole("link", { name: /Speed/ })).toHaveTextContent(
      "#301:05.4",
    );
  });

  it("does not look up the speed standing outside the game pages", async () => {
    await renderGameModeCards("/stats");

    expect(fetchSpeedStanding).not.toHaveBeenCalled();
  });

  it("flags Speed as new until the player has discovered it", async () => {
    localStorage.removeItem(SPEED_SEEN_KEY);
    await renderGameModeCards("/");

    expect(screen.getByRole("link", { name: /Speed/ })).toHaveTextContent(
      "New",
    );
  });

  it("calls onNavigate when a card is clicked", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    await renderGameModeCards("/", { onNavigate });

    await user.click(screen.getByRole("link", { name: /Speed/ }));

    expect(onNavigate).toHaveBeenCalledOnce();
  });
});
