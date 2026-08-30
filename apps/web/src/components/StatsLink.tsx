import { Link } from "@tanstack/react-router";
import { m } from "../paraglide/messages.js";
import { ChartIcon } from "./icons/ChartIcon";
import { ChevronIcon } from "./icons/ChevronIcon";
import styles from "./StatsLink.module.css";

interface StatsLinkProps {
  to: "/admin/stats" | "/admin";
}

export function StatsLink({ to }: StatsLinkProps) {
  const isBackToAdmin = to === "/admin";
  return (
    <Link
      to={to}
      className={styles.statsLink}
      aria-label={isBackToAdmin ? m.admin_link_label() : m.stats_link_label()}
    >
      {isBackToAdmin ? <ChevronIcon direction="left" /> : <ChartIcon />}
    </Link>
  );
}
