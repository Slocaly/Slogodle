import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "src/test/render-with-providers";
import { markSpeedSeen } from "src/hooks/useSpeedNew";
import { ModeSwitch } from "../ModeSwitch";

const SPEED_SEEN_KEY = "slogodle_speed_seen_v1";

const renderModeSwitch = (path: string) =>
  act(() => render(<ModeSwitch />, { path }));

describe("ModeSwitch", () => {
  beforeEach(() => {
    localStorage.setItem(SPEED_SEEN_KEY, "1");
  });

  it("links to both modes on the daily page", async () => {
    await renderModeSwitch("/");

    expect(screen.getByRole("link", { name: "Daily" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Speed" })).toHaveAttribute(
      "href",
      "/speed",
    );
  });

  it("marks Daily as the active mode on the daily page", async () => {
    await renderModeSwitch("/");

    expect(screen.getByRole("link", { name: "Daily" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Speed" })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks Speed as the active mode on speed pages", async () => {
    await renderModeSwitch("/speed/history");

    expect(screen.getByRole("link", { name: "Speed" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Daily" })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("is hidden on other pages", async () => {
    await renderModeSwitch("/stats");

    expect(
      screen.queryByRole("navigation", { name: "Play" }),
    ).not.toBeInTheDocument();
  });

  it("flags Speed as new until the player has discovered it", async () => {
    localStorage.removeItem(SPEED_SEEN_KEY);
    await renderModeSwitch("/");

    expect(screen.getByRole("link", { name: "Speed New" })).toBeVisible();
  });

  it("stops flagging Speed once it has been discovered", async () => {
    localStorage.removeItem(SPEED_SEEN_KEY);
    await renderModeSwitch("/");

    act(() => markSpeedSeen());

    expect(screen.getByRole("link", { name: "Speed" })).toBeVisible();
    expect(screen.queryByText("New")).not.toBeInTheDocument();
  });

  it("does not flag Speed when it was already discovered", async () => {
    await renderModeSwitch("/");

    expect(screen.queryByText("New")).not.toBeInTheDocument();
  });

  it("navigates to Speed when its link is clicked", async () => {
    const user = userEvent.setup();
    const { router } = await renderModeSwitch("/");

    await user.click(screen.getByRole("link", { name: /Speed/ }));

    expect(router.state.location.pathname).toBe("/speed");
  });
});
