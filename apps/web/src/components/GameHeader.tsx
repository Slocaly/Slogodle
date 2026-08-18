import { m } from '../paraglide/messages.js'
import { DarkModeToggle } from './DarkModeToggle'
import styles from './GameHeader.module.css'

interface GameHeaderProps {
  archiveOpen: boolean
  onToggleArchive: () => void
  dark: boolean
  onToggleDark: () => void
}

export function GameHeader({ archiveOpen, onToggleArchive, dark, onToggleDark }: GameHeaderProps) {
  return (
    <header className={styles.header}>
      <span className={styles.title}>{m.site_title()}</span>
      <div className={styles.headerActions}>
        <button type="button" className={styles.archiveToggle} aria-label={m.archive_toggle()} onClick={onToggleArchive}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </button>
        <DarkModeToggle dark={dark} onToggle={onToggleDark} />
      </div>
    </header>
  )
}
