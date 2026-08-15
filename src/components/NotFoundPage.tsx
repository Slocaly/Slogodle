import { Link } from '@tanstack/react-router'
import { m } from '../paraglide/messages.js'

export function NotFoundPage() {
  return (
    <div className="page">
      <main className="game-area" id="main">
        <div className="card">
          <div className="day-label-row">
            <div className="day-label">404</div>
          </div>
          <div className="reveal-name">{m.not_found_title()}</div>
          <p className="reveal-fact">{m.not_found_message()}</p>
          <Link to="/" className="back-today-btn">
            {m.not_found_cta()}
          </Link>
        </div>
      </main>
    </div>
  )
}
