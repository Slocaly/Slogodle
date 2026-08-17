import { useEffect, useState } from 'react'
import { now, subscribe as subscribeClock } from '../lib/clock'
import { nextLocalMidnight, formatCountdown } from '../lib/game-logic'
import { m } from '../paraglide/messages.js'
import styles from './CountdownTimer.module.css'

export function CountdownTimer() {
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

  return (
    <div className={styles.position}>
      <div className={styles.timer}>
        <span className={styles.eyebrow}>{m.countdown_eyebrow()}</span>
        <span className={styles.value}>{label}</span>
      </div>
    </div>
  )
}
