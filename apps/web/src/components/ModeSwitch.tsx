import { Link, useLocation } from "@tanstack/react-router";
import { m } from "../paraglide/messages.js";
import { useSpeedNew } from "../hooks/useSpeedNew";
import { NewBadge } from "./NewBadge";
import styles from "./ModeSwitch.module.css";

/** Desktop header pill to flip between Daily and Speed. */
export function ModeSwitch() {
  const { pathname } = useLocation();
  const onSpeed = pathname === "/speed";
  const speedIsNew = useSpeedNew();
  if (pathname !== "/" && !onSpeed) return null;
  return (
    <nav className={styles.switch} aria-label={m.mode_section_label()}>
      <Link to="/" className={styles.item} data-active={!onSpeed || undefined}>
        {m.mode_daily_label()}
      </Link>
      <Link to="/speed" className={styles.item} data-active={onSpeed || undefined}>
        {m.mode_speed_label()}
        {speedIsNew && <NewBadge />}
      </Link>
    </nav>
  );
}
