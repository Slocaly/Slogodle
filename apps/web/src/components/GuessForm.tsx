import { useRef, useState } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { LOGOS, type Logo } from '@slogodle/logos'
import { suggestionsFor } from '../lib/game-logic'
import { m } from '../paraglide/messages.js'
import { GuessHints } from './GuessHints'
import { GuessSuggestions } from './GuessSuggestions'
import styles from './GuessForm.module.css'

interface GuessFormProps {
  onSubmit: (text: string) => void
  logo: Logo
  attemptCount: number
}

export function GuessForm({ onSubmit, logo, attemptCount }: GuessFormProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  // base-ui fires onInputValueChange with the picked label right after onValueChange;
  // this ref swallows that one call so the input doesn't flash the label before clearing.
  const suppressNextInputValueRef = useRef<string | null>(null)
  const suggestions = suggestionsFor(value, LOGOS, null)

  function handleInputValueChange(next: string) {
    if (suppressNextInputValueRef.current === next) {
      suppressNextInputValueRef.current = null
      return
    }
    setValue(next)
  }

  function handleValueChange(name: string | null) {
    if (name) {
      suppressNextInputValueRef.current = name
      onSubmit(name)
      setValue('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className={styles.playArea}>
      <Combobox.Root
        items={suggestions}
        filter={null}
        inputValue={value}
        onInputValueChange={handleInputValueChange}
        onValueChange={handleValueChange}
      >
        <Combobox.Input
          ref={inputRef}
          data-form-type="other"
          className={styles.guessInput}
          placeholder={m.guess_placeholder()}
        />
        <GuessSuggestions suggestions={suggestions} />
      </Combobox.Root>
      <GuessHints logo={logo} attemptCount={attemptCount} />
    </div>
  )
}
