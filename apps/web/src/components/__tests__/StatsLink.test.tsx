import { act, screen } from "@testing-library/react";
import { render } from "src/test/render-with-providers";
import { StatsLink } from "../StatsLink";

describe("StatsLink", () => {
  it.each([
    ["/stats", "View stats"],
    ["/admin/stats", "View stats"],
  ] as const)("links %s as a stats entry", async (to, name) => {
    await act(() => render(<StatsLink to={to} />));

    expect(screen.getByRole("link", { name })).toHaveAttribute("href", to);
  });

  it.each([
    ["/", "Back to game"],
    ["/speed", "Back to Speed"],
    ["/admin", "Back to admin"],
  ] as const)("links %s as a way back", async (to, name) => {
    await act(() => render(<StatsLink to={to} />));

    expect(screen.getByRole("link", { name })).toHaveAttribute("href", to);
  });

  it("shows the streak next to the stats link when the player has one", async () => {
    await act(() => render(<StatsLink streak={7} to="/stats" />));

    const link = screen.getByRole("link", { name: /Streak/ });

    expect(link).toHaveTextContent("Streak7");
    expect(link).toHaveAttribute("href", "/stats");
  });

  it("shows a zero streak too", async () => {
    await act(() => render(<StatsLink streak={0} to="/stats" />));

    expect(screen.getByRole("link", { name: /Streak/ })).toHaveTextContent(
      "Streak0",
    );
  });

  it("ignores the streak on a back link", async () => {
    await act(() => render(<StatsLink streak={7} to="/" />));

    expect(
      screen.getByRole("link", { name: "Back to game" }),
    ).not.toHaveTextContent("7");
  });
});
