// src/components/LogoCard.tsx
import type { Logo } from '../data/logos'
import type { GameStatus } from '../lib/game-logic'

interface LogoCardProps {
  dayIndex: number
  status: GameStatus
  logo: Logo
  isToday: boolean
  onBackToday: () => void
}

export function LogoCard({ dayIndex, status, logo, isToday, onBackToday }: LogoCardProps) {
  const label =
    status === 'playing'
      ? `GUESS THE LOGO · #${dayIndex + 1}`
      : status === 'won'
        ? `SOLVED — #${dayIndex + 1}`
        : `MISSED — #${dayIndex + 1}`

  return (
    <>
      <div className="day-label-row">
        <div className="day-label">{label}</div>
        {!isToday && (
          <button type="button" className="back-today-btn" onClick={onBackToday}>
            ← Back to today
          </button>
        )}
      </div>
      <div className="logo-wrap">
        {/* svgPath comes from our own static data/logos.ts, never from user input */}
        <svg
          id="logo-svg"
          width="100"
          height="100"
          viewBox={logo.viewBox}
          xmlns="http://www.w3.org/2000/svg"
          data-status={status}
          dangerouslySetInnerHTML={{ __html: logo.svgPath }}
        />
      </div>
    </>
  )
}
