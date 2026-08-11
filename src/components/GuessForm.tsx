import { useRef } from 'react'
import { LOGOS, type Logo } from '../data/logos'
import { suggestionsFor } from '../lib/game-logic'

interface GuessFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (text: string) => void
  logo: Logo
  attemptCount: number
  maxTries: number
}

export function GuessForm({ value, onChange, onSubmit, logo, attemptCount, maxTries }: GuessFormProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestions = suggestionsFor(value, LOGOS, null)
  const hints = ['Wrong guess reveals a hint.', `Industry: ${logo.industry}`, `Founded: ${logo.founded}`]
  const hint = hints[Math.min(attemptCount, hints.length - 1)]

  return (
    <div className="play-area">
      <div className="input-wrap">
        <input
          ref={inputRef}
          type="text"
          className="guess-input"
          placeholder="TYPE A COMPANY NAME"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit(value)
          }}
        />
        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((name) => (
              <div
                key={name}
                className="suggestion"
                onClick={() => {
                  onChange(name)
                  inputRef.current?.focus()
                }}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="dots">
        {Array.from({ length: maxTries }, (_, i) => (
          <span key={i} className={'dot' + (i < attemptCount ? ' dot-used' : '')} />
        ))}
      </div>
      <div className="hint">{hint}</div>
    </div>
  )
}
