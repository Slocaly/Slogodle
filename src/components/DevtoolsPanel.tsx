import { useEffect, useState } from 'react'
import { now, isSimulated, setSimulatedDate, nudgeDays, resetClock, subscribe as subscribeClock } from '../lib/clock'
import { useClock } from '../hooks/useClock'

function formatDateInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function DevtoolsPanel({
  onResetDay,
  onFakeLaunch,
}: {
  onResetDay: () => void
  onFakeLaunch: () => void
}) {
  useClock() // subscribes this component to clock-offset changes so it re-renders
  const [open, setOpen] = useState(false)
  const [dateInput, setDateInput] = useState(() => formatDateInput(now()))

  useEffect(() => subscribeClock(() => setDateInput(formatDateInput(now()))), [])

  function jump() {
    const [y, m, d] = dateInput.split('-').map(Number)
    if (!y || !m || !d) return
    const target = now()
    target.setFullYear(y, m - 1, d)
    setSimulatedDate(target)
  }

  return (
    <div className="devtools">
      <button
        type="button"
        className="devtools-toggle"
        aria-label="Toggle day simulator"
        onClick={() => setOpen((o) => !o)}
      >
        🛠
      </button>
      {open && (
        <div className="devtools-panel">
          <div className="devtools-row">
            {isSimulated() ? `Simulated: ${now().toDateString()}` : 'Real time'}
          </div>
          <div className="devtools-row">
            <input
              type="date"
              className="devtools-date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
            <button type="button" onClick={jump}>
              Jump
            </button>
          </div>
          <div className="devtools-row">
            <button type="button" onClick={() => nudgeDays(-1)}>
              −1 day
            </button>
            <button type="button" onClick={() => nudgeDays(1)}>
              +1 day
            </button>
            <button type="button" onClick={() => resetClock()}>
              Reset to now
            </button>
          </div>
          <div className="devtools-row">
            <button type="button" onClick={onResetDay}>
              Reset day
            </button>
            <button type="button" onClick={onFakeLaunch}>
              🎉 Fake win
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
