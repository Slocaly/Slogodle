import { useEffect, useState } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'
import { now, subscribe as subscribeClock } from '../lib/clock'
import { nextLocalMidnight, formatCountdown, type Guess } from '../lib/game-logic'
import type { Logo } from '../data/logos'
import { m } from '../paraglide/messages.js'

interface RevealPanelProps {
  logo: Logo
  guesses: Guess[]
  maxTries: number
  streak: number
  isToday: boolean
  onBackToday: () => void
}

function useCountdown(active: boolean): string {
  const [label, setLabel] = useState(() => formatCountdown(nextLocalMidnight(now()).getTime() - now().getTime()))

  useEffect(() => {
    if (!active) return
    const update = () => setLabel(formatCountdown(nextLocalMidnight(now()).getTime() - now().getTime()))
    update()
    const id = setInterval(update, 1000)
    const unsubscribe = subscribeClock(update)
    return () => {
      clearInterval(id)
      unsubscribe()
    }
  }, [active])

  return label
}

export function RevealPanel({ logo, guesses, maxTries, streak, isToday, onBackToday }: RevealPanelProps) {
  const countdown = useCountdown(isToday)

  return (
    <div className="reveal">
      <div className="reveal-name">{logo.name}</div>
      <div className="reveal-fact">{logo.funFact}</div>
      <Tooltip.Root>
        <Tooltip.Trigger
          className="github-link-btn"
          render={
            <a href={logo.gitLink} target="_blank" rel="noreferrer noopener" aria-label={m.reveal_github_link({ name: logo.name })} />
          }
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
          </svg>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={8}>
            <Tooltip.Popup className="tooltip-popup">{m.reveal_github_link({ name: logo.name })}</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
      <div className="share-grid">
        {Array.from({ length: maxTries }, (_, i) => {
          const g = guesses[i]
          const cls = g ? (g.correct ? 'share-correct' : 'share-wrong') : 'share-empty'
          return <span key={i} className={'share-cell ' + cls} />
        })}
      </div>
      {isToday ? (
        <div className="meta-row">
          <span>{m.meta_streak({ streak })}</span>
          <span>{m.meta_next_in({ countdown })}</span>
        </div>
      ) : (
        <div className="meta-row">
          <button type="button" className="back-today-btn" onClick={onBackToday}>
            {m.back_to_today()}
          </button>
        </div>
      )}
    </div>
  )
}
