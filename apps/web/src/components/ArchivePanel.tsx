import type { Logo } from '@slogodle/logos'
import { ARCHIVE_DAYS, type GameStatus } from '../lib/game-logic'
import { ArchiveDayButton } from './ArchiveDayButton'
import styles from './ArchivePanel.module.css'

interface ArchivePanelProps {
  open: boolean
  dayIndex: number
  activeDayIndex: number
  history: Record<string, GameStatus>
  onSelectDay: (dayIndex: number) => void
  bank: Logo[]
}

export function ArchivePanel({ open, dayIndex, activeDayIndex, history, onSelectDay, bank }: ArchivePanelProps) {
  const dayIndices = Array.from({ length: ARCHIVE_DAYS }, (_, i) => dayIndex - 1 - i).filter((idx) => idx >= 0)

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
      </div>
    </div>
  )
}
