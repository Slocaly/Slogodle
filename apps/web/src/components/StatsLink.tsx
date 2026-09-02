import { Link } from "@tanstack/react-router";
import { m } from "../paraglide/messages.js";
import { ChartIcon } from "./icons/ChartIcon";
import { ChevronIcon } from "./icons/ChevronIcon";
import { FireIcon } from "./icons/FireIcon";
import styles from "./StatsLink.module.css";

interface StatsLinkProps {
  to: "/admin/stats" | "/admin" | "/stats" | "/";
  streak?: number;
}

const STATS_TARGETS: StatsLinkProps["to"][] = ["/admin/stats", "/stats"];
const BACK_LABELS: Record<StatsLinkProps["to"], (() => string) | undefined> = {
  "/admin/stats": undefined,
  "/stats": undefined,
  "/admin": m.admin_link_label,
  "/": m.game_link_label,
};

export function StatsLink({ to, streak }: StatsLinkProps) {
  const isBack = !STATS_TARGETS.includes(to);
  const isPersonalStats = to === "/stats" && streak !== undefined;

  return (
    <Link
      to={to}
      className={`${styles.statsLink} ${isPersonalStats ? styles.statsLinkLabeled : ""}`}
      aria-label={isBack ? BACK_LABELS[to]!() : isPersonalStats ? undefined : m.stats_link_label()}
    >
      {isBack ? (
        <ChevronIcon direction="left" />
      ) : isPersonalStats ? (
        <span
          className={`${styles.streakBadge} ${streak > 0 ? styles.streakLit : styles.streakDim}`}
        >
          <FireIcon filled={streak > 0} />
          <span>{m.burger_streak_label()}</span>
          <span className={styles.streakCount}>{streak}</span>
        </span>
      ) : (
        <ChartIcon />
      )}
    </Link>
  );
}
