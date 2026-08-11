import { useEffect, useReducer, useState } from 'react'
import { LOGOS, type Logo } from '../data/logos'
import { loadJSON, saveJSON } from '../lib/storage'
import { now, subscribe as subscribeClock } from '../lib/clock'
import { dayIndexFor, pickLogo, isCorrectGuess, computeStreak, type Guess, type GameStatus } from '../lib/game-logic'

const MAX_TRIES = 3
const TODAY_KEY = 'logodle_today_v1'
const HISTORY_KEY = 'logodle_history_v1'
const DARK_KEY = 'logodle_dark_v1'

interface DayState {
  dayIndex: number
  logo: Logo
  guesses: Guess[]
  status: GameStatus
}

interface SavedToday {
  dayIndex: number
  guesses: Guess[]
  status: GameStatus
}

function loadDay(): DayState {
  const dayIndex = dayIndexFor(now())
  const logo = pickLogo(LOGOS, dayIndex)
  const saved = loadJSON<SavedToday | null>(TODAY_KEY, null)
  const resuming = saved !== null && saved.dayIndex === dayIndex
  return {
    dayIndex,
    logo,
    guesses: resuming ? saved!.guesses : [],
    status: resuming ? saved!.status : 'playing',
  }
}

type Action = { type: 'RELOAD_DAY' } | { type: 'SUBMIT_GUESS'; text: string }

function reducer(state: DayState, action: Action): DayState {
  switch (action.type) {
    case 'RELOAD_DAY':
      return loadDay()
    case 'SUBMIT_GUESS': {
      if (state.status !== 'playing' || !action.text.trim()) return state
      const correct = isCorrectGuess(action.text, state.logo)
      const guesses = [...state.guesses, { text: action.text.trim(), correct }]
      const status: GameStatus = correct ? 'won' : guesses.length >= MAX_TRIES ? 'lost' : 'playing'
      return { ...state, guesses, status }
    }
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, undefined, loadDay)
  const [history, setHistory] = useState<Record<string, GameStatus>>(() => loadJSON(HISTORY_KEY, {}))
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DARK_KEY) === '1'
    } catch (e) {
      return false
    }
  })
  const [value, setValue] = useState('')
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [, forceTick] = useState(0)

  // Persist today's progress, and fold a finished day into history, whenever they change.
  useEffect(() => {
    saveJSON(TODAY_KEY, { dayIndex: state.dayIndex, guesses: state.guesses, status: state.status })
    if (state.status !== 'playing' && history[String(state.dayIndex)] !== state.status) {
      const next = { ...history, [String(state.dayIndex)]: state.status }
      saveJSON(HISTORY_KEY, next)
      setHistory(next)
    }
  }, [state.dayIndex, state.guesses, state.status, history])

  // Persist dark-mode preference and reflect it on <html data-theme>.
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    try {
      localStorage.setItem(DARK_KEY, dark ? '1' : '0')
    } catch (e) {
      // best-effort, matches current behavior
    }
  }, [dark])

  // Tick every second; reload the day if it has rolled over since the last tick.
  useEffect(() => {
    const id = setInterval(() => {
      if (dayIndexFor(now()) !== state.dayIndex) {
        dispatch({ type: 'RELOAD_DAY' })
        setValue('')
      } else {
        forceTick((t) => t + 1)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [state.dayIndex])

  // React to devtools clock changes immediately, not just on the next 1s tick.
  useEffect(
    () =>
      subscribeClock(() => {
        dispatch({ type: 'RELOAD_DAY' })
        setValue('')
      }),
    [],
  )

  const streak = computeStreak(history, state.dayIndex)

  function submitGuess(text: string) {
    dispatch({ type: 'SUBMIT_GUESS', text })
    setValue('')
  }

  return {
    dayIndex: state.dayIndex,
    logo: state.logo,
    guesses: state.guesses,
    status: state.status,
    value,
    setValue,
    submitGuess,
    archiveOpen,
    toggleArchive: () => setArchiveOpen((v) => !v),
    dark,
    toggleDark: () => setDark((d) => !d),
    history,
    streak,
    maxTries: MAX_TRIES,
  }
}
