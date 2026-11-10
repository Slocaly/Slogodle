import { act, screen } from "@testing-library/react";
import { render } from "src/test/render-with-providers";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge", () => {
  it("announces a won game as solved", async () => {
    await act(() => render(<StatusBadge isWon />));

    expect(screen.getByRole("img", { name: "Solved" })).toBeVisible();
  });

  it("announces a lost game as missed", async () => {
    await act(() => render(<StatusBadge isWon={false} />));

    expect(screen.getByRole("img", { name: "Missed" })).toBeVisible();
    expect(
      screen.queryByRole("img", { name: "Solved" }),
    ).not.toBeInTheDocument();
  });
});
