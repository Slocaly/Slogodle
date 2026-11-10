import { act, screen } from "@testing-library/react";
import { render } from "src/test/render-with-providers";
import { createTestingLogo } from "src/test/create-testing-logo";
import { GuessHints } from "../GuessHints";

const logo = createTestingLogo({ founded: 2013, industry: "Frontend library" });

describe("GuessHints", () => {
  it("tells the player a wrong guess reveals a hint before any attempt", async () => {
    await act(() => render(<GuessHints logo={logo} attemptCount={0} />));

    expect(screen.getByText("Wrong guess reveals a hint.")).toBeVisible();
    expect(screen.queryByText("Hint n°1")).not.toBeInTheDocument();
  });

  it("reveals the founding year after one wrong guess", async () => {
    await act(() => render(<GuessHints logo={logo} attemptCount={1} />));

    expect(screen.getByText("Hint n°1")).toBeVisible();
    expect(screen.getByText("Founded: 2013")).toBeVisible();
    expect(
      screen.queryByText("Industry: Frontend library"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Wrong guess reveals a hint."),
    ).not.toBeInTheDocument();
  });

  it("also reveals the industry after two wrong guesses", async () => {
    await act(() => render(<GuessHints logo={logo} attemptCount={2} />));

    expect(screen.getByText("Founded: 2013")).toBeVisible();
    expect(screen.getByText("Hint n°2")).toBeVisible();
    expect(screen.getByText("Industry: Frontend library")).toBeVisible();
  });
});
