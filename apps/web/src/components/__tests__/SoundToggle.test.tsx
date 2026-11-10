import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "src/test/render-with-providers";
import { SoundToggle } from "../SoundToggle";

describe("SoundToggle", () => {
  it("offers to turn the sound off while it is on", async () => {
    await act(() =>
      render(<SoundToggle soundEnabled onSoundToggle={vi.fn()} />),
    );

    expect(
      screen.getByRole("button", { name: "Turn sound off" }),
    ).toBeVisible();
  });

  it("offers to turn the sound on while it is off", async () => {
    await act(() =>
      render(<SoundToggle soundEnabled={false} onSoundToggle={vi.fn()} />),
    );

    expect(screen.getByRole("button", { name: "Turn sound on" })).toBeVisible();
  });

  it("calls onSoundToggle when clicked", async () => {
    const user = userEvent.setup();
    const onSoundToggle = vi.fn();
    await act(() =>
      render(<SoundToggle soundEnabled onSoundToggle={onSoundToggle} />),
    );

    await user.click(screen.getByRole("button", { name: "Turn sound off" }));

    expect(onSoundToggle).toHaveBeenCalledOnce();
  });
});
