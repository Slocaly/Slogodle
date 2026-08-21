import { Combobox } from '@base-ui/react/combobox'
import styles from './GuessSuggestions.module.css'

export function GuessSuggestions({ suggestions }: { suggestions: { label: string; value: string }[] }) {
  if (suggestions.length === 0) return null

  return (
    <Combobox.Portal>
      <Combobox.Positioner className={styles.suggestionsPositioner} sideOffset={8}>
        <Combobox.Popup className={styles.suggestions} data-scrollable={suggestions.length >= 7 || undefined}>
          <Combobox.List className={styles.suggestionsList}>
            {(logo: { label: string; value: string }) => (
              <Combobox.Item key={logo.value} value={logo.value} className={styles.suggestion}>
                {logo.label}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  )
}
