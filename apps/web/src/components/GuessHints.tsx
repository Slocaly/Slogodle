import type { Logo } from '@slogodle/logos'
import { m } from '../paraglide/messages.js'
import styles from './GuessHints.module.css'

export function GuessHints({ logo, attemptCount }: { logo: Logo; attemptCount: number }) {
  if (attemptCount === 0) return <div className={styles.hintPrompt}>{m.hint_wrong_guess()}</div>

  const revealedHints = [
    m.hint_founded({ founded: logo.founded }),
    m.hint_industry({ industry: logo.industry }),
  ].slice(0, attemptCount)

  return (
    <div className={styles.hints}>
      {revealedHints.map((hint, i) => (
        <div key={hint} className={styles.hint}>
          <span className={styles.hintLabel}>{m.hint_label({ n: i + 1 })}</span>
          <span className={styles.hintText}>{hint}</span>
        </div>
      ))}
    </div>
  )
}
