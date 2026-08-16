import { Link } from '@tanstack/react-router'
import { m } from '../paraglide/messages.js'
import shared from '../styles/shared.module.css'

export function NotFoundPage() {
  return (
    <div className={shared.page}>
      <main className={shared.gameArea} id="main">
        <div className={shared.card}>
          <div className={shared.dayLabelRow}>
            <div className={shared.dayLabel}>404</div>
          </div>
          <div className={shared.revealName}>{m.not_found_title()}</div>
          <p className={shared.revealFact}>{m.not_found_message()}</p>
          <Link to="/" className={shared.backTodayBtn}>
            {m.not_found_cta()}
          </Link>
        </div>
      </main>
    </div>
  )
}
