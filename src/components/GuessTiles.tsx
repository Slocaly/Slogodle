// src/components/GuessTiles.tsx
import type { Guess } from '../lib/game-logic'

export function GuessTiles({ guesses }: { guesses: Guess[] }) {
  return (
    <div className="guesses">
      {guesses.map((g, i) => (
        <div key={i} className={'guess-tile ' + (g.correct ? 'guess-correct' : 'guess-wrong')}>
          {g.text}
        </div>
      ))}
    </div>
  )
}
