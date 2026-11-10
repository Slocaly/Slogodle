import { act, screen } from "@testing-library/react";
import { createTestingLogo } from "src/test/create-testing-logo";
import { render } from "src/test/render-with-providers";
import { LogoCard } from "../LogoCard";

const logo = createTestingLogo({ name: "React" });

const renderLogoCard = (
  props: Partial<React.ComponentProps<typeof LogoCard>> = {},
) =>
  act(() =>
    render(
      <LogoCard
        dayIndex={4}
        guesses={[]}
        logo={logo}
        maxTries={3}
        status="playing"
        {...props}
      />,
    ),
  );

describe("LogoCard", () => {
  describe("while playing", () => {
    it("labels the card with the 1-based day number", async () => {
      await renderLogoCard();

      expect(screen.getByText("#5")).toBeVisible();
    });

    it("shows a mystery logo and masks its name", async () => {
      await renderLogoCard();

      expect(
        screen.getByRole("img", { name: "Mystery logo to guess" }),
      ).toBeVisible();
      expect(screen.queryByText("React")).not.toBeInTheDocument();
      expect(screen.getByText("*x|*x")).toBeInTheDocument(); // aria-hidden mask
    });

    it("does not show the won/lost badge", async () => {
      await renderLogoCard();

      expect(
        screen.queryByRole("img", { name: "Solved" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("img", { name: "Missed" }),
      ).not.toBeInTheDocument();
    });

    it("shows the guesses made so far", async () => {
      await renderLogoCard({ guesses: [{ correct: false, text: "Vue" }] });

      expect(screen.getByText("Vue")).toBeInTheDocument();
    });
  });

  describe("once finished", () => {
    it("reveals the logo and its name and badges a win as solved", async () => {
      await renderLogoCard({ status: "won" });

      expect(screen.getByRole("img", { name: "React logo" })).toBeVisible();
      expect(screen.getByText("React")).toBeVisible();
      expect(screen.getByRole("img", { name: "Solved" })).toBeVisible();
    });

    it("reveals the logo and badges a loss as missed", async () => {
      await renderLogoCard({ status: "lost" });

      expect(screen.getByRole("img", { name: "React logo" })).toBeVisible();
      expect(screen.getByRole("img", { name: "Missed" })).toBeVisible();
      expect(
        screen.queryByRole("img", { name: "Mystery logo to guess" }),
      ).not.toBeInTheDocument();
    });
  });
});
