import { useRef, useState } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { LOGOS, type Logo } from '../data/logos'
import { suggestionsFor } from '../lib/game-logic'
import { m } from '../paraglide/messages.js'
import styles from './GuessForm.module.css'

interface GuessFormProps {
  onSubmit: (text: string) => void
  logo: Logo
  attemptCount: number
}

export function GuessForm({ onSubmit, logo, attemptCount }: GuessFormProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const suppressNextInputValueRef = useRef<string | null>(null)
  const suggestions = suggestionsFor(value, LOGOS, null)
  const revealedHints = [
    m.hint_founded({ founded: logo.founded }),
    m.hint_industry({ industry: logo.industry }),
  ].slice(0, attemptCount)

  return (
    <div className={styles.playArea}>
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
          className={styles.guessInput}
          placeholder={m.guess_placeholder()}
        />
        {suggestions.length > 0 && (
          <Combobox.Portal>
            <Combobox.Positioner className={styles.suggestionsPositioner} sideOffset={8}>
              <Combobox.Popup className={styles.suggestions}>
                <Combobox.List>
                  {(logo: { label: string; value: string }) => (
                    <Combobox.Item key={logo.value} value={logo.value} className={styles.suggestion}>
                      {logo.label}
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        )}
      </Combobox.Root>
      {attemptCount === 0 ? (
        <div className={styles.hintPrompt}>{m.hint_wrong_guess()}</div>
      ) : (
        <div className={styles.hints}>
          {revealedHints.map((hint, i) => (
            <div key={hint} className={styles.hint}>
              <span className={styles.hintLabel}>{m.hint_label({ n: i + 1 })}</span>
              <span className={styles.hintText}>{hint}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
