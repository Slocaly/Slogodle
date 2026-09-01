import { Dialog } from "@base-ui/react/dialog";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { m } from "../paraglide/messages.js";
import { authClient } from "../lib/auth-client";
import { useAccountSession } from "../hooks/useAccountSession";
import { ArchiveIcon } from "./icons/ArchiveIcon";
import { BurgerIcon } from "./icons/BurgerIcon";
import { CloseIcon } from "./icons/CloseIcon";
import { FireIcon } from "./icons/FireIcon";
import styles from "./BurgerMenu.module.css";

interface BurgerMenuProps {
  streak?: number;
}

export function BurgerMenu({ streak }: BurgerMenuProps) {
  const navigate = useNavigate();
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

          <button
            type="button"
            className={styles.menuItem}
            onClick={() => go("/history")}
          >
            <ArchiveIcon />
            {m.burger_history_label()}
          </button>

          {streak !== undefined && (
            <button
              type="button"
              className={styles.menuItem}
              onClick={() => go("/stats")}
            >
              <FireIcon
                filled={streak > 0}
                className={streak > 0 ? styles.streakLit : styles.streakDim}
              />
              {m.burger_streak_label()}
              <span className={styles.streakCount}>{streak}</span>
            </button>
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
