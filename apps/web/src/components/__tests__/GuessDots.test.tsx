import { act, screen } from "@testing-library/react";
import { render } from "src/test/render-with-providers";
import { GuessDots } from "../GuessDots";

describe("GuessDots", () => {
  it("shows the text of every guess made", async () => {
    await act(() =>
      render(
        <GuessDots
          guesses={[
            { correct: false, text: "Vue" },
            { correct: true, text: "React" },
          ]}
          maxTries={3}
        />,
      ),
    );

    expect(screen.getByText("Vue")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });
});
