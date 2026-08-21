// src/components/BackToTodayButton.tsx
import { m } from "../paraglide/messages.js";
import styles from "./BackToTodayButton.module.css";

interface BackToTodayButtonProps {
  onBackToday: () => void;
}

export function BackToTodayButton({ onBackToday }: BackToTodayButtonProps) {
  return (
    <div className={styles.position}>
      <button type="button" className={styles.button} onClick={onBackToday}>
        {m.back_to_today()}
      </button>
    </div>
  );
}
