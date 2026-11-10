import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { authClient } from "src/lib/auth-client";
import { fetchIsAdmin } from "src/lib/session";
import { mockAuthSession } from "src/test/mock-auth-session";
import { render } from "src/test/render-with-providers";
import { AccountMenu } from "../AccountMenu";

vi.setConfig({ restoreMocks: true });

// better-auth's hooks have no service underneath to cut at; signOut is its network call.
vi.mock("src/lib/auth-client", () => ({
  authClient: { signOut: vi.fn(), useSession: vi.fn() },
}));
vi.mock("src/lib/session", () => ({
  fetchIsAdmin: vi.fn(),
}));

const renderAccountMenu = (path = "/stats") =>
  act(() => render(<AccountMenu />, { path }));

describe("AccountMenu", () => {
  beforeEach(() => {
    vi.mocked(fetchIsAdmin).mockResolvedValue(false);
    vi.mocked(authClient.signOut).mockResolvedValue({} as never);
  });

  it("is hidden while the session is loading", async () => {
    mockAuthSession("pending");
    await renderAccountMenu();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  describe("when signed out", () => {
    beforeEach(() => {
      mockAuthSession("anonymous");
    });

    it("offers to log in or sign up", async () => {
      const user = userEvent.setup();
      await renderAccountMenu();

      await user.click(screen.getByRole("button", { name: "Log in" }));

      expect(
        await screen.findByRole("menuitem", { name: "Log in" }),
      ).toBeVisible();
      expect(screen.getByRole("menuitem", { name: "Sign up" })).toBeVisible();
      expect(
        screen.queryByRole("menuitem", { name: "Log out" }),
      ).not.toBeInTheDocument();
    });

    it("goes to the login page", async () => {
      const user = userEvent.setup();
      const { router } = await renderAccountMenu();

      await user.click(screen.getByRole("button", { name: "Log in" }));
      await user.click(await screen.findByRole("menuitem", { name: "Log in" }));

      expect(router.state.location.pathname).toBe("/login");
    });

    it("goes to the signup page", async () => {
      const user = userEvent.setup();
      const { router } = await renderAccountMenu();

      await user.click(screen.getByRole("button", { name: "Log in" }));
      await user.click(
        await screen.findByRole("menuitem", { name: "Sign up" }),
      );

      expect(router.state.location.pathname).toBe("/signup");
    });
  });

  describe("when signed in", () => {
    beforeEach(() => {
      mockAuthSession({ user: { name: "ada" } });
    });

    it("shows the user's initial on the trigger", async () => {
      await renderAccountMenu();

      expect(screen.getByRole("button", { name: "Account" })).toHaveTextContent(
        "A",
      );
    });

    it("shows the user's name and a log out action but no admin entry", async () => {
      const user = userEvent.setup();
      await renderAccountMenu();

      await user.click(screen.getByRole("button", { name: "Account" }));

      expect(await screen.findByText("ada")).toBeVisible();
      expect(screen.getByRole("menuitem", { name: "Log out" })).toBeVisible();
      expect(
        screen.queryByRole("menuitem", { name: "Admin" }),
      ).not.toBeInTheDocument();
    });

    it("signs out and goes back to the home page", async () => {
      const user = userEvent.setup();
      const { router } = await renderAccountMenu("/stats");

      await user.click(screen.getByRole("button", { name: "Account" }));
      await user.click(
        await screen.findByRole("menuitem", { name: "Log out" }),
      );

      await vi.waitFor(() => expect(router.state.location.pathname).toBe("/"));
      expect(authClient.signOut).toHaveBeenCalledOnce();
    });

    it("offers the admin page to admins", async () => {
      const user = userEvent.setup();
      vi.mocked(fetchIsAdmin).mockResolvedValue(true);
      const { router } = await renderAccountMenu();

      await user.click(screen.getByRole("button", { name: "Account" }));
      await user.click(await screen.findByRole("menuitem", { name: "Admin" }));

      expect(router.state.location.pathname).toBe("/admin");
    });
  });
});
