// src/components/StatusBadge.tsx
import { m } from "../paraglide/messages.js";
import { CheckIcon, CrossIcon } from "./StatusIcons";
import styles from "./StatusBadge.module.css";

interface StatusBadgeProps {
  isWon: boolean;
}

export function StatusBadge({ isWon }: StatusBadgeProps) {
  return (
    <div
      className={`${styles.statusBadge} ${isWon ? styles.statusWon : styles.statusLost}`}
      role="img"
      aria-label={isWon ? m.archive_status_solved() : m.archive_status_missed()}
    >
      {isWon ? <CheckIcon /> : <CrossIcon />}
    </div>
  );
}
