import { m } from '../paraglide/messages.js'
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
        <button
          type="button"
          className={styles.darkToggle}
          aria-label={dark ? m.theme_toggle_to_light() : m.theme_toggle_to_dark()}
          onClick={onToggleDark}
        >
          {dark ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
