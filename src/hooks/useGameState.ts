import { useEffect, useState } from 'react'
import { LOGOS, type Logo } from '../data/logos'
import { loadJSON, saveJSON } from '../lib/storage'
import { now, subscribe as subscribeClock } from '../lib/clock'
import { dayIndexFor, pickLogo, isCorrectGuess, computeStreak, type Guess, type GameStatus } from '../lib/game-logic'

const MAX_TRIES = 3
const OLD_TODAY_KEY = 'logodle_today_v1'
const OLD_HISTORY_KEY = 'logodle_history_v1'
const DAYS_KEY = 'logodle_days_v1'
const DARK_KEY = 'logodle_dark_v1'

interface DayRecord {
  guesses: Guess[]
  status: GameStatus
}

type DaysRecord = Record<string, DayRecord>

interface OldSavedToday {
  dayIndex: number
  guesses: Guess[]
  status: GameStatus
}

const EMPTY_DAY: DayRecord = { guesses: [], status: 'playing' }

// One-time migration from the old two-key storage format (today-only slot +
// status-only history) into a single per-day record. Runs at most once per
// browser: after it saves DAYS_KEY, `loadJSON(DAYS_KEY, null)` will return a
// non-null value (even `{}` for a fresh install) so this body never runs again.
function loadDays(): DaysRecord {
  const existing = loadJSON<DaysRecord | null>(DAYS_KEY, null)
  if (existing) return existing

  const migrated: DaysRecord = {}
  const oldHistory = loadJSON<Record<string, GameStatus>>(OLD_HISTORY_KEY, {})
  for (const [key, status] of Object.entries(oldHistory)) {
    migrated[key] = { guesses: [], status }
  }
  const oldToday = loadJSON<OldSavedToday | null>(OLD_TODAY_KEY, null)
  if (oldToday) {
    migrated[String(oldToday.dayIndex)] = { guesses: oldToday.guesses, status: oldToday.status }
  }
  saveJSON(DAYS_KEY, migrated)
  return migrated
}

export function useGameState() {
  const [todayIndex, setTodayIndex] = useState(() => dayIndexFor(now()))
  const [activeDayIndex, setActiveDayIndex] = useState(() => dayIndexFor(now()))
  const [pinnedToToday, setPinnedToToday] = useState(true)
  const [days, setDays] = useState<DaysRecord>(loadDays)
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DARK_KEY) === '1'
    } catch (e) {
      return false
    }
  })
  const [archiveOpen, setArchiveOpen] = useState(false)

  const logo = pickLogo(LOGOS, activeDayIndex)
  const dayRecord = days[String(activeDayIndex)] ?? EMPTY_DAY
  const isToday = activeDayIndex === todayIndex

  // Persist per-day state whenever it changes.
  useEffect(() => {
    saveJSON(DAYS_KEY, days)
  }, [days])

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    try {
      localStorage.setItem(DARK_KEY, dark ? '1' : '0')
    } catch (e) {
      // best-effort, matches current behavior
    }
  }, [dark])

  // Check once a second whether the real day has rolled over; if it has and
  // we're pinned to today, follow it. If the user has navigated to a past
  // day (unpinned), leave them there through a rollover.
  useEffect(() => {
    const id = setInterval(() => {
      const freshTodayIndex = dayIndexFor(now())
      if (freshTodayIndex !== todayIndex) {
        setTodayIndex(freshTodayIndex)
        if (pinnedToToday) {
          setActiveDayIndex(freshTodayIndex)
        }
      }
    }, 1000)
    return () => clearInterval(id)
  }, [todayIndex, pinnedToToday])

  // React to devtools clock changes immediately, not just on the next 1s tick.
  useEffect(
    () =>
      subscribeClock(() => {
        const freshTodayIndex = dayIndexFor(now())
        setTodayIndex(freshTodayIndex)
        if (pinnedToToday) {
          setActiveDayIndex(freshTodayIndex)
        }
      }),
    [pinnedToToday],
  )

  const history: Record<string, GameStatus> = {}
  for (const [key, record] of Object.entries(days)) {
    if (record.status !== 'playing') {
      history[key] = record.status
    }
  }
  const streak = computeStreak(history, todayIndex)

  function submitGuess(text: string) {
    if (dayRecord.status !== 'playing' || !text.trim()) return
    const correct = isCorrectGuess(text, logo)
    const guesses = [...dayRecord.guesses, { text: text.trim(), correct }]
    const status: GameStatus = correct ? 'won' : guesses.length >= MAX_TRIES ? 'lost' : 'playing'
    setDays((prev) => ({ ...prev, [String(activeDayIndex)]: { guesses, status } }))
    console.log('submitGuess', text, 'correct', correct, 'status', status, 'guesses', guesses)
    return { status, attempts: guesses.length }
  }

  function viewDay(dayIndex: number) {
    setPinnedToToday(false)
    setActiveDayIndex(dayIndex)
    setArchiveOpen(false)
  }

  function returnToToday() {
    setPinnedToToday(true)
    setActiveDayIndex(todayIndex)
  }

  function resetDay() {
    setDays((prev) => {
      const next = { ...prev }
      delete next[String(activeDayIndex)]
      return next
    })
  }

  return {
    dayIndex: activeDayIndex,
    todayIndex,
    isToday,
    logo,
    guesses: dayRecord.guesses,
    status: dayRecord.status,
    submitGuess,
    viewDay,
    returnToToday,
    resetDay,
    archiveOpen,
    toggleArchive: () => setArchiveOpen((v) => !v),
    dark,
    toggleDark: () => setDark((d) => !d),
    history,
    streak,
    maxTries: MAX_TRIES,
  }
}
