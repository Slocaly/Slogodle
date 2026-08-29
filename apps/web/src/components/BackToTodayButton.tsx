// src/components/BackToTodayButton.tsx
import { ChevronIcon } from "./icons/ChevronIcon";
import { m } from "../paraglide/messages.js";
import styles from "./BackToTodayButton.module.css";

interface BackToTodayButtonProps {
  dayIndex: number;
  todayIndex: number;
  onBackToday: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export function BackToTodayButton({
  dayIndex,
  todayIndex,
  onBackToday,
  onPrevDay,
  onNextDay,
}: BackToTodayButtonProps) {
  const canGoPrev = dayIndex > 0;
  const canGoNext = dayIndex < todayIndex;
  // Display numbers are 1-based (day #1, #2, ...), matching the "#N" badge
  // shown on the card itself, while dayIndex/todayIndex stay 0-based.
  const prevDayNumber = dayIndex;
  const nextDayNumber = Math.min(dayIndex + 1, todayIndex) + 1;

  return (
    <div className={styles.position}>
      <button
        type="button"
        className={styles.arrowButton}
        onClick={onPrevDay}
        disabled={!canGoPrev}
        aria-label={m.day_nav_previous()}
      >
        <ChevronIcon direction="left" />
        {canGoPrev && <span className={styles.dayNumber}>#{prevDayNumber}</span>}
      </button>
      <button type="button" className={styles.button} onClick={onBackToday}>
        {m.back_to_today()}
      </button>
      <button
        type="button"
        className={styles.arrowButton}
        onClick={onNextDay}
        disabled={!canGoNext}
        aria-label={m.day_nav_next()}
      >
        {canGoNext && <span className={styles.dayNumber}>#{nextDayNumber}</span>}
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}
