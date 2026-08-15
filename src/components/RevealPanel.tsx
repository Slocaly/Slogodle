import { useEffect, useState } from 'react'
import { now, subscribe as subscribeClock } from '../lib/clock'
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

function useCountdown(active: boolean): string {
  const [label, setLabel] = useState(() => formatCountdown(nextLocalMidnight(now()).getTime() - now().getTime()))

  useEffect(() => {
    if (!active) return
    const update = () => setLabel(formatCountdown(nextLocalMidnight(now()).getTime() - now().getTime()))
    update()
    const id = setInterval(update, 1000)
    const unsubscribe = subscribeClock(update)
    return () => {
      clearInterval(id)
      unsubscribe()
    }
  }, [active])

  return label
}

export function RevealPanel({ logo, guesses, maxTries, streak, isToday, onBackToday }: RevealPanelProps) {
  const countdown = useCountdown(isToday)

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
          <span>next in {countdown}</span>
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
