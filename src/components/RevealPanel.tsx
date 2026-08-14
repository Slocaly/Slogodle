import { now } from '../lib/clock'
import { nextLocalMidnight, formatCountdown, type Guess } from '../lib/game-logic'
import type { Logo } from '../data/logos'

interface RevealPanelProps {
  logo: Logo
  guesses: Guess[]
  maxTries: number
  streak: number
  isToday: boolean
  onBackToday: () => void
}

export function RevealPanel({ logo, guesses, maxTries, streak, isToday, onBackToday }: RevealPanelProps) {
  return (
    <div className="reveal">
      <div className="reveal-name">{logo.name}</div>
      <div className="reveal-fact">{logo.funFact}</div>
      <div className="share-grid">
        {Array.from({ length: maxTries }, (_, i) => {
          const g = guesses[i]
          const cls = g ? (g.correct ? 'share-correct' : 'share-wrong') : 'share-empty'
          return <span key={i} className={'share-cell ' + cls} />
        })}
      </div>
      {isToday ? (
        <div className="meta-row">
          <span>streak {streak}</span>
          <span>next in {formatCountdown(nextLocalMidnight(now()).getTime() - now().getTime())}</span>
        </div>
      ) : (
        <div className="meta-row">
          <button type="button" className="back-today-btn" onClick={onBackToday}>
            ← Back to today
          </button>
        </div>
      )}
    </div>
  )
}
