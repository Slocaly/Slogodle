import { getLocale, locales, setLocale } from '../paraglide/runtime.js'
import { m } from '../paraglide/messages.js'
import styles from './GameHeader.module.css'

interface GameHeaderProps {
  archiveOpen: boolean
  onToggleArchive: () => void
  dark: boolean
  onToggleDark: () => void
}

export function GameHeader({ archiveOpen, onToggleArchive, dark, onToggleDark }: GameHeaderProps) {
  const locale = getLocale()

  return (
    <header className={styles.header}>
      <span className={styles.title}>{m.site_title()}</span>
      <div className={styles.headerActions}>
        <button type="button" className={styles.archiveToggle} onClick={onToggleArchive}>
          <span>{m.archive_toggle()}</span>
          <span className={styles.archiveArrow}>{archiveOpen ? '▲' : '▼'}</span>
        </button>
        <button
          type="button"
          className={styles.localeToggle}
          aria-label={m.locale_toggle_label()}
          onClick={() => setLocale(locales[(locales.indexOf(locale) + 1) % locales.length]!)}
        >
          {locale.toUpperCase()}
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
