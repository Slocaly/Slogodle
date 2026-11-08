import { Link, useLocation } from "@tanstack/react-router";
import { m } from "../paraglide/messages.js";
import { useSpeedNew } from "../hooks/useSpeedNew";
import { useSpeedStanding } from "../hooks/useSpeedStanding";
import { formatTime } from "../lib/speed";
import { FireIcon } from "./icons/FireIcon";
import { NewBadge } from "./NewBadge";
import styles from "./GameModeCards.module.css";

interface GameModeCardsProps {
  streak?: number;
  onNavigate?: () => void;
}

export function GameModeCards({ streak, onNavigate }: GameModeCardsProps) {
  const { pathname } = useLocation();
  const onSpeed = pathname === "/speed";
  const isGamePage = pathname === "/" || onSpeed;
  const speedIsNew = useSpeedNew();
  const { data: standing } = useSpeedStanding(isGamePage);

  // Only the two game pages offer a mode switch; History, Stats, etc. just go back.
  if (!isGamePage) return null;

  return (
    <section aria-label={m.mode_section_label()}>
      <div className={styles.label}>{m.mode_section_label()}</div>
      <div className={styles.cards}>
        <Link
          to="/"
          className={styles.card}
          data-active={!onSpeed || undefined}
          aria-current={!onSpeed ? "page" : undefined}
          onClick={onNavigate}
        >
          <span className={styles.title}>{m.mode_daily_label()}</span>
          {streak !== undefined ? (
            <span className={styles.status}>
              <FireIcon
                filled={streak > 0}
                className={streak > 0 ? styles.streakLit : styles.streakDim}
              />
              {streak}
            </span>
          ) : (
            <span className={styles.hint}>{m.mode_daily_hint()}</span>
          )}
        </Link>
        <Link
          to="/speed"
          className={styles.card}
          data-active={onSpeed || undefined}
          aria-current={onSpeed ? "page" : undefined}
          onClick={onNavigate}
        >
          <span className={styles.title}>
            {m.mode_speed_label()} {speedIsNew && <NewBadge />}
          </span>
          {standing ? (
            <span className={styles.status}>
              {standing.rank !== null && <strong>#{standing.rank}</strong>}
              {formatTime(standing.scoreMs)}
            </span>
          ) : (
            <span className={styles.hint}>
              {m.mode_speed_hint()} · {m.mode_speed_play()}
            </span>
          )}
        </Link>
      </div>
    </section>
  );
}
