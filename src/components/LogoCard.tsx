// src/components/LogoCard.tsx
import type { Logo } from '../data/logos'
import type { GameStatus } from '../lib/game-logic'
import { m } from '../paraglide/messages.js'
import shared from '../styles/shared.module.css'
import styles from './LogoCard.module.css'

interface LogoCardProps {
  dayIndex: number
  status: GameStatus
  logo: Logo
  isToday: boolean
  onBackToday: () => void
}

export function LogoCard({ dayIndex, status, logo, isToday, onBackToday }: LogoCardProps) {
  const label =
    status === 'playing'
      ? m.logo_label_playing({ day: dayIndex + 1 })
      : status === 'won'
        ? m.logo_label_solved({ day: dayIndex + 1 })
        : m.logo_label_missed({ day: dayIndex + 1 })

  const alt = status === 'playing' ? m.logo_alt_playing() : m.logo_alt_revealed({ name: logo.name })

  return (
    <>
      <div className={shared.dayLabelRow}>
        <div className={shared.dayLabel}>{label}</div>
        {!isToday && (
          <button type="button" className={shared.backTodayBtn} onClick={onBackToday}>
            {m.back_to_today()}
          </button>
        )}
      </div>
      <div className={styles.logoWrap}>
        <img className={styles.logoSvg} width="100" height="100" src={logo.icon} alt={alt} data-status={status} />
      </div>
    </>
  )
}
