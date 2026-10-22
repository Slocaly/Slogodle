import { useEffect, useState } from 'react'
import { now, subscribe as subscribeClock } from '../lib/clock'
import { nextLocalMidnight, formatCountdown } from '../lib/game-logic'
import { m } from '../paraglide/messages.js'
import { ChevronIcon } from './icons/ChevronIcon'
import styles from './CountdownTimer.module.css'

interface CountdownTimerProps {
  dayIndex?: number
  onPrevDay?: () => void
}

export function CountdownTimer({ dayIndex = 0, onPrevDay }: CountdownTimerProps) {
  const [label, setLabel] = useState(() => formatCountdown(nextLocalMidnight(now()).getTime() - now().getTime()))

  useEffect(() => {
    const update = () => setLabel(formatCountdown(nextLocalMidnight(now()).getTime() - now().getTime()))
    update()
    const id = setInterval(update, 1000)
    const unsubscribe = subscribeClock(update)
    return () => {
      clearInterval(id)
      unsubscribe()
    }
  }, [])

  // Display number is 1-based, matching the "#N" badge on the card.
  const canGoPrev = onPrevDay != null && dayIndex > 0

  return (
    <div className={styles.position}>
      {canGoPrev && (
        <button
          type="button"
          className={styles.arrowButton}
          onClick={onPrevDay}
          aria-label={m.day_nav_previous()}
        >
          <ChevronIcon direction="left" />
          <span className={styles.dayNumber}>#{dayIndex}</span>
        </button>
      )}
      <div className={styles.timer}>
        <span className={styles.eyebrow}>{m.countdown_eyebrow()}</span>
        <span className={styles.value}>{label}</span>
      </div>
    </div>
  )
}
