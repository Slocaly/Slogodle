import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { authClient } from "src/lib/auth-client";
import { fetchIsAdmin } from "src/lib/session";
import { fetchSpeedStanding } from "src/lib/speed-runs";
import { mockAuthSession } from "src/test/mock-auth-session";
import { render } from "src/test/render-with-providers";
import { BurgerMenu } from "../BurgerMenu";

vi.setConfig({ restoreMocks: true });

// better-auth's hooks have no service underneath to cut at; signOut is its network call.
vi.mock("src/lib/auth-client", () => ({
  authClient: { signOut: vi.fn(), useSession: vi.fn() },
}));
vi.mock("src/lib/session", () => ({
  fetchIsAdmin: vi.fn(),
}));
vi.mock("src/lib/speed-runs", () => ({
  fetchSpeedStanding: vi.fn(),
}));

const renderBurgerMenu = async (path = "/", streak?: number) => {
  const user = userEvent.setup();
  const rendered = await act(() =>
    render(<BurgerMenu streak={streak} />, { path }),
  );
  const open = () => user.click(screen.getByRole("button", { name: "Menu" }));
  return { ...rendered, open, user };
};

describe("BurgerMenu", () => {
  beforeEach(() => {
    localStorage.setItem("slogodle_speed_seen_v1", "1");
    mockAuthSession("anonymous");
    vi.mocked(fetchIsAdmin).mockResolvedValue(false);
    vi.mocked(fetchSpeedStanding).mockResolvedValue(null);
    vi.mocked(authClient.signOut).mockResolvedValue({} as never);
  });

  it("is hidden while the session is loading", async () => {
    mockAuthSession("pending");
    await renderBurgerMenu();

    expect(
      screen.queryByRole("button", { name: "Menu" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the menu closed until the trigger is pressed", async () => {
    await renderBurgerMenu();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens a dialog with the game modes, and closes it with the close button", async () => {
    const { open, user } = await renderBurgerMenu("/", 3);

    await open();

    expect(await screen.findByRole("dialog")).toBeVisible();
    expect(screen.getByRole("link", { name: /Daily/ })).toBeVisible();
    expect(screen.getByRole("link", { name: /Speed/ })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Close menu" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when a game mode is picked", async () => {
    const { open, user } = await renderBurgerMenu("/");
    await open();

    await user.click(await screen.findByRole("link", { name: /Speed/ }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("on the daily page", () => {
    it("offers history and stats", async () => {
      const { open } = await renderBurgerMenu("/");

      await open();

      expect(
        await screen.findByRole("button", { name: "History" }),
      ).toBeVisible();
      expect(screen.getByRole("button", { name: "View stats" })).toBeVisible();
    });

    it("goes to the daily history and closes", async () => {
      const { open, router, user } = await renderBurgerMenu("/");
      await open();

      await user.click(await screen.findByRole("button", { name: "History" }));

      expect(router.state.location.pathname).toBe("/history");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("goes to the stats", async () => {
      const { open, router, user } = await renderBurgerMenu("/");
      await open();

      await user.click(
        await screen.findByRole("button", { name: "View stats" }),
      );

      expect(router.state.location.pathname).toBe("/stats");
    });
  });

  describe("on the speed page", () => {
    it("offers the speed history but no stats", async () => {
      const { open } = await renderBurgerMenu("/speed");

      await open();

      expect(
        await screen.findByRole("button", { name: "History" }),
      ).toBeVisible();
      expect(
        screen.queryByRole("button", { name: "View stats" }),
      ).not.toBeInTheDocument();
    });

    it("goes to the speed history", async () => {
      const { open, router, user } = await renderBurgerMenu("/speed");
      await open();

      await user.click(await screen.findByRole("button", { name: "History" }));

      expect(router.state.location.pathname).toBe("/speed/history");
    });
  });

  describe("when signed out", () => {
    it("offers to log in or sign up", async () => {
      const { open } = await renderBurgerMenu();

      await open();

      expect(
        await screen.findByRole("button", { name: "Log in" }),
      ).toBeVisible();
      expect(screen.getByRole("button", { name: "Sign up" })).toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Log out" }),
      ).not.toBeInTheDocument();
    });

    it("goes to the login page", async () => {
      const { open, router, user } = await renderBurgerMenu();
      await open();

      await user.click(await screen.findByRole("button", { name: "Log in" }));

      expect(router.state.location.pathname).toBe("/login");
    });

    it("goes to the signup page", async () => {
      const { open, router, user } = await renderBurgerMenu();
      await open();

      await user.click(await screen.findByRole("button", { name: "Sign up" }));

      expect(router.state.location.pathname).toBe("/signup");
    });
  });

  describe("when signed in", () => {
    beforeEach(() => {
      mockAuthSession({ user: { name: "Ada" } });
    });

    it("shows the user's name and log out, but not log in or admin", async () => {
      const { open } = await renderBurgerMenu();

      await open();

      expect(await screen.findByText("Ada")).toBeVisible();
      expect(screen.getByRole("button", { name: "Log out" })).toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Log in" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Admin" }),
      ).not.toBeInTheDocument();
    });

    it("signs out, closes and goes back to the home page", async () => {
      const { open, router, user } = await renderBurgerMenu("/stats");
      await open();

      await user.click(await screen.findByRole("button", { name: "Log out" }));

      await vi.waitFor(() => expect(router.state.location.pathname).toBe("/"));
      expect(authClient.signOut).toHaveBeenCalledOnce();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("offers the admin page to admins", async () => {
      vi.mocked(fetchIsAdmin).mockResolvedValue(true);
      const { open, router, user } = await renderBurgerMenu();
      await open();

      await user.click(await screen.findByRole("button", { name: "Admin" }));

      expect(router.state.location.pathname).toBe("/admin");
    });
  });
});
