import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "src/test/render-with-providers";
import { DarkModeToggle } from "../DarkModeToggle";

describe("DarkModeToggle", () => {
  it("offers to switch to light mode while dark", async () => {
    await act(() => render(<DarkModeToggle dark onDarkModeToggle={vi.fn()} />));

    expect(
      screen.getByRole("button", { name: "Switch to light mode" }),
    ).toBeVisible();
  });

  it("offers to switch to dark mode while light", async () => {
    await act(() =>
      render(<DarkModeToggle dark={false} onDarkModeToggle={vi.fn()} />),
    );

    expect(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    ).toBeVisible();
  });

  it("calls onDarkModeToggle when clicked", async () => {
    const user = userEvent.setup();
    const onDarkModeToggle = vi.fn();
    await act(() =>
      render(
        <DarkModeToggle dark={false} onDarkModeToggle={onDarkModeToggle} />,
      ),
    );

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    );

    expect(onDarkModeToggle).toHaveBeenCalledOnce();
  });
});
