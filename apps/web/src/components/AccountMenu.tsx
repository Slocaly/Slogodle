import { Menu } from "@base-ui/react/menu";
import { useNavigate } from "@tanstack/react-router";
import { m } from "../paraglide/messages.js";
import { authClient } from "../lib/auth-client";
import { UserIcon } from "./icons/UserIcon";
import styles from "./AccountMenu.module.css";

export function AccountMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;

  const handleLogout = async () => {
    await authClient.signOut();
    navigate({ to: "/" });
  };

  const handleLogin = () => {
    navigate({ to: "/login" });
  };

  const handleSignup = () => {
    navigate({ to: "/signup" });
  };

  return (
    <Menu.Root>
      <Menu.Trigger
        className={styles.trigger}
        aria-label={
          session ? m.account_menu_label() : m.account_login_label()
        }
      >
        {session?.user.name ? (
          <span className={styles.initial}>
            {session.user.name.charAt(0).toUpperCase()}
          </span>
        ) : (
          <UserIcon />
        )}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          className={styles.positioner}
          sideOffset={8}
          align="end"
        >
          <Menu.Popup className={styles.popup}>
            {session ? (
              <>
                <div className={styles.name}>{session.user.name}</div>
                <Menu.Item
                  className={styles.menuItem}
                  onClick={handleLogout}
                >
                  {m.account_logout()}
                </Menu.Item>
              </>
            ) : (
              <>
                <Menu.Item className={styles.menuItem} onClick={handleLogin}>
                  {m.account_login_label()}
                </Menu.Item>
                <Menu.Item className={styles.menuItem} onClick={handleSignup}>
                  {m.account_signup_label()}
                </Menu.Item>
              </>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
