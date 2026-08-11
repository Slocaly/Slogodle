interface GameHeaderProps {
  archiveOpen: boolean
  onToggleArchive: () => void
  dark: boolean
  onToggleDark: () => void
}

export function GameHeader({ archiveOpen, onToggleArchive, dark, onToggleDark }: GameHeaderProps) {
  return (
    <header className="header">
      <span className="title">Guess the Logo</span>
      <div className="header-actions">
        <button type="button" className="archive-toggle" onClick={onToggleArchive}>
          <span>Past days</span>
          <span className="archive-arrow">{archiveOpen ? '▲' : '▼'}</span>
        </button>
        <button
          type="button"
          className="dark-toggle"
          data-on={String(dark)}
          aria-label="Toggle dark mode"
          onClick={onToggleDark}
        >
          <span className="dark-toggle-knob" />
        </button>
      </div>
    </header>
  )
}
