import { Dialog } from "@base-ui/react/dialog";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { m } from "../paraglide/messages.js";
import { authClient } from "../lib/auth-client";
import { useAccountSession } from "../hooks/useAccountSession";
import { ArchiveIcon } from "./icons/ArchiveIcon";
import { BurgerIcon } from "./icons/BurgerIcon";
import { ChartIcon } from "./icons/ChartIcon";
import { CloseIcon } from "./icons/CloseIcon";
import { GameModeCards } from "./GameModeCards";
import styles from "./BurgerMenu.module.css";

interface BurgerMenuProps {
  streak?: number;
}

export function BurgerMenu({ streak }: BurgerMenuProps) {
  const navigate = useNavigate();
  // Speed has no history or stats yet.
  const showDailyLinks = useLocation().pathname !== "/speed";
  const { session, isPending, isAdmin } = useAccountSession();
  const [open, setOpen] = useState(false);

  if (isPending) return null;

  const go = (to: "/history" | "/stats" | "/login" | "/signup" | "/admin") => {
    setOpen(false);
    navigate({ to });
  };

  const handleLogout = async () => {
    setOpen(false);
    await authClient.signOut();
    navigate({ to: "/" });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={styles.trigger} aria-label={m.burger_menu_label()}>
        <BurgerIcon />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup}>
          <div className={styles.popupHeader}>
            <span className={styles.popupTitle}>{m.burger_menu_label()}</span>
            <Dialog.Close className={styles.closeButton} aria-label={m.burger_close_label()}>
              <CloseIcon />
            </Dialog.Close>
          </div>

          <GameModeCards streak={streak} onNavigate={() => setOpen(false)} />

          {showDailyLinks && (
            <>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => go("/history")}
              >
                <ArchiveIcon />
                {m.burger_history_label()}
              </button>

              <button
                type="button"
                className={styles.menuItem}
                onClick={() => go("/stats")}
              >
                <ChartIcon />
                {m.stats_link_label()}
              </button>
            </>
          )}

          <div className={styles.divider} />

          {session ? (
            <>
              <div className={styles.name}>{session.user.name}</div>
              {isAdmin && (
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={() => go("/admin")}
                >
                  {m.account_admin_label()}
                </button>
              )}
              <button
                type="button"
                className={styles.menuItem}
                onClick={handleLogout}
              >
                {m.account_logout()}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => go("/login")}
              >
                {m.account_login_label()}
              </button>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => go("/signup")}
              >
                {m.account_signup_label()}
              </button>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
