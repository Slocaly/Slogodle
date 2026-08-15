import { useRef, useState } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { LOGOS, type Logo } from '../data/logos'
import { suggestionsFor } from '../lib/game-logic'
import { m } from '../paraglide/messages.js'

interface GuessFormProps {
  onSubmit: (text: string) => void
  logo: Logo
  attemptCount: number
  maxTries: number
}

export function GuessForm({ onSubmit, logo, attemptCount, maxTries }: GuessFormProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const suppressNextInputValueRef = useRef<string | null>(null)
  const suggestions = suggestionsFor(value, LOGOS, null)
  const hints = [
    m.hint_wrong_guess(),
    m.hint_industry({ industry: logo.industry }),
    m.hint_founded({ founded: logo.founded }),
  ]
  const hint = hints[Math.min(attemptCount, hints.length - 1)]

  return (
    <div className="play-area">
      <Combobox.Root
        items={suggestions}
        filter={null}
        inputValue={value}
        onInputValueChange={(next) => {
          if (suppressNextInputValueRef.current === next) {
            suppressNextInputValueRef.current = null
            return
          }
          setValue(next)
        }}
        onValueChange={(name: string | null) => {
          if (name) {
            suppressNextInputValueRef.current = name
            onSubmit(name)
            setValue('')
            inputRef.current?.focus()
          }
        }}
      >
        <Combobox.Input
          ref={inputRef}
          data-form-type="other"
          className="guess-input"
          placeholder={m.guess_placeholder()}
        />
        {suggestions.length > 0 && (
          <Combobox.Portal>
            <Combobox.Positioner className="suggestions-positioner" sideOffset={8}>
              <Combobox.Popup className="suggestions">
                <Combobox.List>
                  {(logo: { label: string; value: string }) => (
                    <Combobox.Item key={logo.value} value={logo.value} className="suggestion">
                      {logo.label}
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        )}
      </Combobox.Root>
      <div className="dots">
        {Array.from({ length: maxTries }, (_, i) => (
          <span key={i} className={'dot' + (i < attemptCount ? ' dot-used' : '')} />
        ))}
      </div>
      <div className="hint">{hint}</div>
    </div>
  )
}
