import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTestingLogo } from "src/test/create-testing-logo";
import { render } from "src/test/render-with-providers";
import { ArchivePanel } from "../ArchivePanel";

const bank = Array.from({ length: 30 }, (_, i) =>
  createTestingLogo({ name: `Logo${i}` }),
);

const renderArchivePanel = (
  props: Partial<React.ComponentProps<typeof ArchivePanel>> = {},
) =>
  act(() =>
    render(
      <ArchivePanel
        activeDayIndex={20}
        bank={bank}
        dayIndex={20}
        history={{}}
        onSelectDay={vi.fn()}
        open
        {...props}
      />,
    ),
  );

describe("ArchivePanel", () => {
  it("shows nothing while closed", async () => {
    await renderArchivePanel({ open: false });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("lists the 5 previous days, most recent first, for an anonymous player", async () => {
    await renderArchivePanel();

    const days = screen.getAllByRole("button").map((b) => b.textContent);

    expect(days).toEqual(["#20", "#19", "#18", "#17", "#16"]);
  });

  it("lists the 10 previous days for a connected player", async () => {
    await renderArchivePanel({ unlimited: true });

    expect(screen.getAllByRole("button")).toHaveLength(10);
  });

  it("never lists days before the first one", async () => {
    await renderArchivePanel({ dayIndex: 2 });

    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "#2",
      "#1",
    ]);
  });

  it("shows each day's result from the history", async () => {
    await renderArchivePanel({ history: { "19": "won", "18": "lost" } });

    expect(
      screen.getAllByRole("img").map((img) => img.getAttribute("aria-label")),
    ).toEqual(["Solved", "Missed", "Not played", "Not played", "Not played"]);
  });

  it("calls onSelectDay with the clicked day", async () => {
    const user = userEvent.setup();
    const onSelectDay = vi.fn();
    await renderArchivePanel({ onSelectDay });

    await user.click(screen.getByRole("button", { name: /#19/ }));

    expect(onSelectDay).toHaveBeenCalledExactlyOnceWith(18);
  });

  it("invites an anonymous player to sign in for more history", async () => {
    await renderArchivePanel({ unlimited: false });

    expect(
      screen.getByRole("link", { name: "Sign in to see more history" }),
    ).toHaveAttribute("href", "/login");
    expect(
      screen.queryByRole("link", { name: "See more" }),
    ).not.toBeInTheDocument();
  });

  it("links a connected player to the full history", async () => {
    await renderArchivePanel({ unlimited: true });

    expect(screen.getByRole("link", { name: "See more" })).toHaveAttribute(
      "href",
      "/history",
    );
    expect(
      screen.queryByRole("link", { name: "Sign in to see more history" }),
    ).not.toBeInTheDocument();
  });
});
