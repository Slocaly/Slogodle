// src/components/GuessTiles.tsx
import type { Guess } from '../lib/game-logic'
import styles from './GuessTiles.module.css'

export function GuessTiles({ guesses }: { guesses: Guess[] }) {
  return (
    <div className={styles.guesses}>
      {guesses.map((g, i) => (
        <div key={i} className={`${styles.guessTile} ${g.correct ? styles.guessCorrect : styles.guessWrong}`}>
          {g.text}
        </div>
      ))}
    </div>
  )
}
