import type { Logo } from '@slogodle/logos'
import { Link } from '@tanstack/react-router'
import { ARCHIVE_DAYS, CONNECTED_ARCHIVE_DAYS, type GameStatus } from '../lib/game-logic'
import { ArchiveDayButton } from './ArchiveDayButton'
import { m } from '../paraglide/messages.js'
import styles from './ArchivePanel.module.css'

interface ArchivePanelProps {
  open: boolean
  dayIndex: number
  activeDayIndex: number
  history: Record<string, GameStatus>
  onSelectDay: (dayIndex: number) => void
  bank: Logo[]
  unlimited?: boolean
}

export function ArchivePanel({ open, dayIndex, activeDayIndex, history, onSelectDay, bank, unlimited }: ArchivePanelProps) {
  const pastDaysCount = unlimited ? CONNECTED_ARCHIVE_DAYS : ARCHIVE_DAYS
  const dayIndices = Array.from({ length: pastDaysCount }, (_, i) => dayIndex - 1 - i).filter((idx) => idx >= 0)

  return (
    <div className={`${styles.archivePanel} ${open ? styles.archivePanelOpen : ''}`}>
      <div className={styles.archiveDays}>
        {open &&
          dayIndices.map((idx) => (
            <ArchiveDayButton
              key={idx}
              dayIdx={idx}
              active={idx === activeDayIndex}
              result={history[String(idx)]}
              bank={bank}
              onSelectDay={onSelectDay}
            />
          ))}
        {open && unlimited && (
          <Link to="/history" className={styles.archiveSeeMore}>
            {m.archive_see_more()}
          </Link>
        )}
        {open && !unlimited && (
          <Link to="/login" className={styles.archiveSeeMore}>
            {m.archive_login_cta()}
          </Link>
        )}
      </div>
    </div>
  )
}
