import { act, screen, within } from "@testing-library/react";
import { fetchSpeedLadder } from "src/lib/speed-runs";
import { createTestingLadderEntry } from "src/test/create-testing-ladder-entry";
import { render } from "src/test/render-with-providers";
import { SpeedLadder } from "../SpeedLadder";

vi.setConfig({ restoreMocks: true });

vi.mock("src/lib/speed-runs", () => ({
  fetchSpeedLadder: vi.fn(),
}));

const renderSpeedLadder = () =>
  act(() => render(<SpeedLadder dayIndex={12} />));

describe("SpeedLadder", () => {
  it("shows nothing while the ladder is loading", async () => {
    vi.mocked(fetchSpeedLadder).mockReturnValue(new Promise(() => {}));
    await renderSpeedLadder();

    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("asks for the ladder of the given day", async () => {
    vi.mocked(fetchSpeedLadder).mockResolvedValue([]);
    await renderSpeedLadder();

    await screen.findByRole("complementary", { name: "Daily ladder" });

    expect(fetchSpeedLadder).toHaveBeenCalledWith({
      data: { anonId: expect.any(String), dayIndex: 12 },
    });
  });

  it("invites players who have not played to play before seeing the ladder", async () => {
    vi.mocked(fetchSpeedLadder).mockResolvedValue(null);
    await renderSpeedLadder();

    expect(
      await screen.findByText("Play this series to see how everyone did."),
    ).toBeVisible();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("encourages the first player when nobody has a time yet", async () => {
    vi.mocked(fetchSpeedLadder).mockResolvedValue([]);
    await renderSpeedLadder();

    expect(
      await screen.findByText("Be the first to make a time!"),
    ).toBeVisible();
  });

  it("ranks the players with their formatted time", async () => {
    vi.mocked(fetchSpeedLadder).mockResolvedValue([
      createTestingLadderEntry({ name: "Ada", scoreMs: 9_800 }),
      createTestingLadderEntry({ name: "Grace", scoreMs: 65_400 }),
    ]);
    await renderSpeedLadder();

    const rows = await screen.findAllByRole("listitem");

    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("1")).toBeVisible();
    expect(within(rows[0]).getByText("Ada")).toBeVisible();
    expect(within(rows[0]).getByText("00:09.8")).toBeVisible();
    expect(within(rows[1]).getByText("2")).toBeVisible();
    expect(within(rows[1]).getByText("Grace")).toBeVisible();
    expect(within(rows[1]).getByText("01:05.4")).toBeVisible();
  });
});
