// src/components/LogoCard.tsx
import type { Logo } from '@slogodle/logos'
import type { GameStatus, Guess } from '../lib/game-logic'
import { m } from '../paraglide/messages.js'
import shared from '../styles/shared.module.css'
import styles from './LogoCard.module.css'

interface LogoCardProps {
  dayIndex: number
  status: GameStatus
  logo: Logo
  isToday: boolean
  onBackToday: () => void
  guesses: Guess[]
  maxTries: number
}

const MASK_CHARS = ['*', 'x', '|']

function maskName(name: string): string {
  let i = 0
  return name.replace(/[A-Za-z0-9]/g, () => MASK_CHARS[i++ % MASK_CHARS.length])
}

export function LogoCard({ dayIndex, status, logo, isToday, onBackToday, guesses, maxTries }: LogoCardProps) {
  const isRevealed = status !== 'playing'
  const label =
    status === 'playing'
      ? m.logo_label_playing({ day: dayIndex + 1 })
      : status === 'won'
        ? m.logo_label_solved({ day: dayIndex + 1 })
        : m.logo_label_missed({ day: dayIndex + 1 })

  const alt = status === 'playing' ? m.logo_alt_playing() : m.logo_alt_revealed({ name: logo.name })

  return (
    <>
      <div className={styles.topRow}>
        <div className={`${shared.dayLabel} ${styles.dayLabelCorner}`}>{label}</div>
        <div className={styles.dots}>
          {Array.from({ length: maxTries }, (_, i) => {
            const g = guesses[i]
            const cls = g ? (g.correct ? styles.dotCorrect : styles.dotWrong) : ''
            return <span key={i} className={`${styles.dot} ${cls}`} />
          })}
        </div>
        {status !== 'playing' && (
          <div
            className={`${styles.statusBadge} ${status === 'won' ? styles.statusWon : styles.statusLost}`}
            role="img"
            aria-label={status === 'won' ? m.archive_status_solved() : m.archive_status_missed()}
          >
            {status === 'won' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="4 12 10 18 20 6" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            )}
          </div>
        )}
      </div>
      {!isToday && (
        <div className={styles.backRow}>
          <button type="button" className={shared.backTodayBtn} onClick={onBackToday}>
            {m.back_to_today()}
          </button>
        </div>
      )}
      <div className={styles.nameRow}>
        <span className={styles.nameText} data-revealed={isRevealed} aria-hidden={!isRevealed}>
          {isRevealed ? logo.name : maskName(logo.name)}
        </span>
      </div>
      <div className={styles.logoWrap}>
        <img className={styles.logoSvg} width="100" height="100" src={logo.icon} alt={alt} data-status={status} />
      </div>
    </>
  )
}
