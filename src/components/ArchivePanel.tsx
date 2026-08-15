import { LOGOS } from '../data/logos'
import { pickLogo, type GameStatus } from '../lib/game-logic'

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
    const statusClass = result === 'won' ? 'archive-won' : result === 'lost' ? 'archive-lost' : 'archive-unplayed'
    const statusLabel = result === 'won' ? 'Solved' : result === 'lost' ? 'Missed' : 'Not played'
    const name = result === 'won' || result === 'lost' ? pickLogo(LOGOS, idx).name : null
    rows.push(
      <button
        type="button"
        className={'archive-day' + (idx === activeDayIndex ? ' archive-day-active' : '')}
        key={idx}
        onClick={() => onSelectDay(idx)}
        aria-current={idx === activeDayIndex ? 'true' : undefined}
      >
        <span className={'archive-dot ' + statusClass} role="img" aria-label={statusLabel} />
        <span>#{idx + 1}</span>
        {name && <span className="archive-day-label">{name}</span>}
      </button>,
    )
  }

  return (
    <div className={'archive-panel' + (open ? ' archive-panel-open' : '')}>
      <div className="archive-days">{open ? rows : null}</div>
    </div>
  )
}
