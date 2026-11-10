import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "src/test/render-with-providers";
import { BackToTodayButton } from "../BackToTodayButton";

const renderBackToTodayButton = (
  props: Partial<React.ComponentProps<typeof BackToTodayButton>> = {},
) =>
  act(() =>
    render(
      <BackToTodayButton
        dayIndex={5}
        onBackToday={vi.fn()}
        onNextDay={vi.fn()}
        onPrevDay={vi.fn()}
        todayIndex={10}
        {...props}
      />,
    ),
  );

describe("BackToTodayButton", () => {
  it("shows the 1-based numbers of the previous and next days", async () => {
    await renderBackToTodayButton({ dayIndex: 5, todayIndex: 10 });

    expect(
      screen.getByRole("button", { name: "Previous day" }),
    ).toHaveTextContent("#5");
    expect(screen.getByRole("button", { name: "Next day" })).toHaveTextContent(
      "#7",
    );
  });

  it("disables the previous arrow on the first day", async () => {
    await renderBackToTodayButton({ dayIndex: 0 });

    expect(screen.getByRole("button", { name: "Previous day" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Previous day" }),
    ).not.toHaveTextContent("#");
  });

  it("disables the next arrow on today", async () => {
    await renderBackToTodayButton({ dayIndex: 10, todayIndex: 10 });

    expect(screen.getByRole("button", { name: "Next day" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Next day" }),
    ).not.toHaveTextContent("#");
  });

  it("enables both arrows in the middle of the archive", async () => {
    await renderBackToTodayButton({ dayIndex: 5, todayIndex: 10 });

    expect(screen.getByRole("button", { name: "Previous day" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next day" })).toBeEnabled();
  });

  it("calls the matching callback for each button", async () => {
    const user = userEvent.setup();
    const onBackToday = vi.fn();
    const onPrevDay = vi.fn();
    const onNextDay = vi.fn();
    await renderBackToTodayButton({ onBackToday, onNextDay, onPrevDay });

    await user.click(screen.getByRole("button", { name: "← Back to today" }));
    await user.click(screen.getByRole("button", { name: "Previous day" }));
    await user.click(screen.getByRole("button", { name: "Next day" }));

    expect(onBackToday).toHaveBeenCalledOnce();
    expect(onPrevDay).toHaveBeenCalledOnce();
    expect(onNextDay).toHaveBeenCalledOnce();
  });

  it("does not call a disabled arrow's callback", async () => {
    const user = userEvent.setup();
    const onPrevDay = vi.fn();
    await renderBackToTodayButton({ dayIndex: 0, onPrevDay });

    await user.click(screen.getByRole("button", { name: "Previous day" }));

    expect(onPrevDay).not.toHaveBeenCalled();
  });
});
