import { useEffect, useState } from 'react'

const DARK_KEY = 'logodle_dark_v1'

export function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DARK_KEY) === '1'
    } catch (e) {
      return false
    }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    try {
      localStorage.setItem(DARK_KEY, dark ? '1' : '0')
    } catch (e) {
      // best-effort, matches current behavior
    }
  }, [dark])

  return { dark, toggleDark: () => setDark((d) => !d) }
}
