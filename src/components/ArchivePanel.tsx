import { LOGOS } from '../data/logos'
import { pickLogo, type GameStatus } from '../lib/game-logic'
import { m } from '../paraglide/messages.js'
import styles from './ArchivePanel.module.css'

const ARCHIVE_DAYS = 5

interface ArchivePanelProps {
  open: boolean
  dayIndex: number
  activeDayIndex: number
  history: Record<string, GameStatus>
  onSelectDay: (dayIndex: number) => void
}

export function ArchivePanel({ open, dayIndex, activeDayIndex, history, onSelectDay }: ArchivePanelProps) {
  const rows = []
  for (let offset = 1; offset <= ARCHIVE_DAYS; offset++) {
    const idx = dayIndex - offset
    if (idx < 0) continue
    const result = history[String(idx)]
    const statusClass = result === 'won' ? styles.archiveWon : result === 'lost' ? styles.archiveLost : styles.archiveUnplayed
    const statusLabel =
      result === 'won' ? m.archive_status_solved() : result === 'lost' ? m.archive_status_missed() : m.archive_status_unplayed()
    const name = result === 'won' || result === 'lost' ? pickLogo(LOGOS, idx).name : null
    rows.push(
      <button
        type="button"
        className={`${styles.archiveDay} ${idx === activeDayIndex ? styles.archiveDayActive : ''}`}
        key={idx}
        onClick={() => onSelectDay(idx)}
        aria-current={idx === activeDayIndex ? 'true' : undefined}
      >
        <span className={`${styles.archiveDot} ${statusClass}`} role="img" aria-label={statusLabel} />
        <span>#{idx + 1}</span>
        {name && <span className={styles.archiveDayLabel}>{name}</span>}
      </button>,
    )
  }

  return (
    <div className={`${styles.archivePanel} ${open ? styles.archivePanelOpen : ''}`}>
      <div className={styles.archiveDays}>{open ? rows : null}</div>
    </div>
  )
}
