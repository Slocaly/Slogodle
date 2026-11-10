import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "src/test/render-with-providers";
import { ArchiveToggle } from "../ArchiveToggle";

describe("ArchiveToggle", () => {
  it("renders a button that calls onToggleArchive", async () => {
    const user = userEvent.setup();
    const onToggleArchive = vi.fn();
    await act(() =>
      render(<ArchiveToggle onToggleArchive={onToggleArchive} />),
    );

    await user.click(screen.getByRole("button", { name: "History" }));

    expect(onToggleArchive).toHaveBeenCalledOnce();
  });

  it("renders a link to the history page when given a destination", async () => {
    await act(() => render(<ArchiveToggle to="/speed/history" />));

    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
      "href",
      "/speed/history",
    );
    expect(
      screen.queryByRole("button", { name: "History" }),
    ).not.toBeInTheDocument();
  });
});
