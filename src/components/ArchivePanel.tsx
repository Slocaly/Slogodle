import type { GameStatus } from '../lib/game-logic'

const ARCHIVE_DAYS = 5

interface ArchivePanelProps {
  open: boolean
  dayIndex: number
  history: Record<string, GameStatus>
}

export function ArchivePanel({ open, dayIndex, history }: ArchivePanelProps) {
  const rows = []
  for (let offset = 1; offset <= ARCHIVE_DAYS; offset++) {
    const idx = dayIndex - offset
    if (idx < 0) continue
    const result = history[String(idx)]
    rows.push(
      <div className="archive-day" key={idx}>
        <span
          className={
            'archive-dot ' +
            (result === 'won' ? 'archive-won' : result === 'lost' ? 'archive-lost' : 'archive-unplayed')
          }
        />
        <span>#{idx + 1}</span>
        <span className="archive-day-label">
          {result === 'won' ? 'Solved' : result === 'lost' ? 'Missed' : 'Not played'}
        </span>
      </div>,
    )
  }

  return (
    <div className="archive-panel" hidden={!open}>
      <div className="archive-days">{open ? rows : null}</div>
    </div>
  )
}
