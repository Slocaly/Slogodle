// src/components/GuessDots.tsx
import type { Guess } from "../lib/game-logic";
import styles from "./GuessDots.module.css";

interface GuessDotsProps {
  guesses: Guess[];
  maxTries: number;
}

export function GuessDots({ guesses, maxTries }: GuessDotsProps) {
  return (
    <div className={styles.dots}>
      {Array.from({ length: maxTries }, (_, i) => {
        const g = guesses[i];
        const cls = g ? (g.correct ? styles.dotCorrect : styles.dotWrong) : "";
        return <span key={i} className={`${styles.dot} ${cls}`} />;
      })}
    </div>
  );
}
