import { act, screen } from "@testing-library/react";
import { render } from "src/test/render-with-providers";
import { LoadingCard } from "../LoadingCard";

describe("LoadingCard", () => {
  it("announces loading as a status", async () => {
    await act(() => render(<LoadingCard variant="loading" />));

    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  });

  it("announces an empty bank as a status", async () => {
    await act(() => render(<LoadingCard variant="empty" />));

    expect(screen.getByRole("status")).toHaveTextContent(
      "No playable logos available yet.",
    );
  });

  it("announces an error as an alert with its message", async () => {
    await act(() =>
      render(<LoadingCard errorMessage="Boom" variant="error" />),
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Boom");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
