import { useState } from 'react'
import type { Logo } from '../data/logos'
import { buildShareText, type GameStatus, type Guess } from '../lib/game-logic'
import { m } from '../paraglide/messages.js'
import shared from '../styles/shared.module.css'
import styles from './RevealPanel.module.css'

interface RevealPanelProps {
  logo: Logo
  isToday: boolean
  onBackToday: () => void
  dayIndex: number
  guesses: Guess[]
  status: GameStatus
  maxTries: number
}

export function RevealPanel({ logo, isToday, onBackToday, dayIndex, guesses, status, maxTries }: RevealPanelProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const text = buildShareText({
      intro: status === 'won' ? m.share_intro_won() : m.share_intro_lost(),
      title: m.site_title(),
      dayIndex,
      guesses,
      status,
      maxTries,
      origin: window.location.origin,
    })
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable (unsupported browser or missing permission); nothing to fall back to
    }
  }

  return (
    <div className={styles.reveal}>
      <div className={shared.revealFact}>{logo.funFact}</div>
      <div className={styles.actionsRow}>
        <a className={styles.githubLinkBtn} href={logo.gitLink} target="_blank" rel="noreferrer noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
          </svg>
          <span>{m.reveal_github_cta()}</span>
        </a>
        <button type="button" className={styles.shareBtn} onClick={handleShare}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span>{copied ? m.share_copied() : m.share_button()}</span>
        </button>
      </div>
    </div>
  )
}
