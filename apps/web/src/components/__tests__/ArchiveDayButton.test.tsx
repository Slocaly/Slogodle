import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTestingLogo } from "src/test/create-testing-logo";
import { render } from "src/test/render-with-providers";
import { ArchiveDayButton } from "../ArchiveDayButton";

// pickLogo(bank, 4) wraps to bank[1] with a 3-logo bank.
const bank = [
  createTestingLogo({ name: "Alpha" }),
  createTestingLogo({ name: "Beta" }),
  createTestingLogo({ name: "Gamma" }),
];

const renderArchiveDayButton = (
  props: Partial<React.ComponentProps<typeof ArchiveDayButton>> = {},
) =>
  act(() =>
    render(
      <ArchiveDayButton
        active={false}
        bank={bank}
        dayIdx={4}
        onSelectDay={vi.fn()}
        result={undefined}
        {...props}
      />,
    ),
  );

describe("ArchiveDayButton", () => {
  it("shows the 1-based day number", async () => {
    await renderArchiveDayButton();

    expect(screen.getByText("#5")).toBeVisible();
  });

  it("hides the logo name and shows 'Not played' for an unplayed day", async () => {
    await renderArchiveDayButton({ result: undefined });

    expect(screen.getByRole("img", { name: "Not played" })).toBeVisible();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });

  it("reveals the logo name and shows 'Solved' for a won day", async () => {
    await renderArchiveDayButton({ result: "won" });

    expect(screen.getByRole("img", { name: "Solved" })).toBeVisible();
    expect(screen.getByText("Beta")).toBeVisible();
  });

  it("reveals the logo name and shows 'Missed' for a lost day", async () => {
    await renderArchiveDayButton({ result: "lost" });

    expect(screen.getByRole("img", { name: "Missed" })).toBeVisible();
    expect(screen.getByText("Beta")).toBeVisible();
  });

  it("marks the active day as current", async () => {
    await renderArchiveDayButton({ active: true });

    expect(screen.getByRole("button")).toHaveAttribute("aria-current", "true");
  });

  it("does not mark an inactive day as current", async () => {
    await renderArchiveDayButton({ active: false });

    expect(screen.getByRole("button")).not.toHaveAttribute("aria-current");
  });

  it("calls onSelectDay with its day index when clicked", async () => {
    const user = userEvent.setup();
    const onSelectDay = vi.fn();
    await renderArchiveDayButton({ onSelectDay });

    await user.click(screen.getByRole("button"));

    expect(onSelectDay).toHaveBeenCalledExactlyOnceWith(4);
  });
});
