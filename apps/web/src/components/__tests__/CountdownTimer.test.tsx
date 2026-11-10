import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "src/test/render-with-providers";
import { CountdownTimer } from "../CountdownTimer";

// Local time, so the countdown to local midnight is the same in every timezone.
const at = (hours: number, minutes: number, seconds: number) =>
  new Date(2026, 5, 10, hours, minutes, seconds);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  vi.setSystemTime(at(22, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("CountdownTimer", () => {
  it("shows the time left until local midnight", async () => {
    await act(() => render(<CountdownTimer />));

    expect(screen.getByText("Next logo in")).toBeVisible();
    expect(screen.getByText("02:00:00")).toBeVisible();
  });

  it("ticks down every second", async () => {
    await act(() => render(<CountdownTimer />));

    await act(() => vi.advanceTimersByTimeAsync(3000));

    expect(screen.getByText("01:59:57")).toBeVisible();
  });

  it("hides the previous-day arrow without an onPrevDay callback", async () => {
    await act(() => render(<CountdownTimer dayIndex={3} />));

    expect(
      screen.queryByRole("button", { name: "Previous day" }),
    ).not.toBeInTheDocument();
  });

  it("hides the previous-day arrow on the first day", async () => {
    await act(() =>
      render(<CountdownTimer dayIndex={0} onPrevDay={vi.fn()} />),
    );

    expect(
      screen.queryByRole("button", { name: "Previous day" }),
    ).not.toBeInTheDocument();
  });

  it("shows the previous day number and calls onPrevDay when clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onPrevDay = vi.fn();
    await act(() =>
      render(<CountdownTimer dayIndex={3} onPrevDay={onPrevDay} />),
    );

    const arrow = screen.getByRole("button", { name: "Previous day" });
    expect(arrow).toHaveTextContent("#3");

    await user.click(arrow);

    expect(onPrevDay).toHaveBeenCalledOnce();
  });
});
