import { useEffect, useState } from 'react'

const SOUND_KEY = 'logodle_sound_v1'

export function useSoundSettings() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SOUND_KEY) === '1'
    } catch (e) {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, soundEnabled ? '1' : '0')
    } catch (e) {
      // best-effort, matches useDarkMode behavior
    }
  }, [soundEnabled])

  return { soundEnabled, toggleSound: () => setSoundEnabled((v) => !v) }
}
