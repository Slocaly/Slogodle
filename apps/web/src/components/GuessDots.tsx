// src/components/GuessDots.tsx
import type { Guess } from "../lib/game-logic";
import styles from "./GuessDots.module.css";

interface GuessDotsProps {
  guesses: Guess[];
  maxTries: number;
  /** Overrides the wrapper's positioning class (defaults to the overlay used on LogoCard). */
  className?: string;
}

export function GuessDots({ guesses, maxTries, className }: GuessDotsProps) {
  return (
    <div className={className ?? styles.dots}>
      {Array.from({ length: maxTries }, (_, i) => {
        const g = guesses[i];
        const cls = g ? (g.correct ? styles.dotCorrect : styles.dotWrong) : "";
        return (
          <span key={i} className={`${styles.dot} ${cls}`}>
            {g && <span className={styles.dotTooltip}>{g.text}</span>}
          </span>
        );
      })}
    </div>
  );
}
