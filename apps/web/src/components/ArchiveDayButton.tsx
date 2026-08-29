import type { Logo } from '@slogodle/logos'
import { pickLogo, type GameStatus } from '../lib/game-logic'
import { m } from '../paraglide/messages.js'
import styles from './ArchiveDayButton.module.css'

export const STATUS_META: Record<'won' | 'lost' | 'unplayed', { dotClass: keyof typeof styles; label: () => string }> = {
  won: { dotClass: 'archiveWon', label: m.archive_status_solved },
  lost: { dotClass: 'archiveLost', label: m.archive_status_missed },
  unplayed: { dotClass: 'archiveUnplayed', label: m.archive_status_unplayed },
}

interface ArchiveDayButtonProps {
  dayIdx: number
  active: boolean
  result: GameStatus | undefined
  bank: Logo[]
  onSelectDay: (dayIndex: number) => void
}

export function ArchiveDayButton({ dayIdx, active, result, bank, onSelectDay }: ArchiveDayButtonProps) {
  const isPlayed = result === 'won' || result === 'lost'
  const { dotClass, label } = STATUS_META[isPlayed ? result : 'unplayed']
  const name = isPlayed ? pickLogo(bank, dayIdx).name : null
  const activeClass = active ? styles.archiveDayActive : ''

  return (
    <button
      type="button"
      className={`${styles.archiveDay} ${activeClass}`}
      onClick={() => onSelectDay(dayIdx)}
      aria-current={active ? 'true' : undefined}
    >
      <span className={`${styles.archiveDot} ${styles[dotClass]}`} role="img" aria-label={label()} />
      <span>#{dayIdx + 1}</span>
      {name && <span className={styles.archiveDayLabel}>{name}</span>}
    </button>
  )
}
