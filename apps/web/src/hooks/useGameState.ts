import { useEffect, useState } from 'react'
import type { Logo } from '@slogodle/logos'
import { fetchGameLogos } from '../lib/game-logos'
import { loadJSON, saveJSON } from '../lib/storage'
import { now, subscribe as subscribeClock } from '../lib/clock'
import { dayIndexFor, pickLogo, isCorrectGuess, computeStreak, type Guess, type GameStatus } from '../lib/game-logic'
import { useDarkMode } from './useDarkMode'
import { useSoundSettings } from './useSoundSettings'

const MAX_TRIES = 3
const OLD_TODAY_KEY = 'logodle_today_v1'
const OLD_HISTORY_KEY = 'logodle_history_v1'
const DAYS_KEY = 'logodle_days_v1'

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
// A since-fixed devtools bug briefly wrote fake "won" records at day indices in this
// range to simulate pile logos. Purge any that made it into a real browser's storage.
const BOGUS_DAY_INDEX_THRESHOLD = -1_000_000

function stripBogusDays(days: DaysRecord): DaysRecord {
  const clean: DaysRecord = {}
  let removedAny = false
  for (const [key, record] of Object.entries(days)) {
    if (Number(key) <= BOGUS_DAY_INDEX_THRESHOLD) {
      removedAny = true
      continue
    }
    clean[key] = record
  }
  return removedAny ? clean : days
}

// One-time migration from the old two-key storage format (today-only slot +
// status-only history) into a single per-day record. Runs at most once per
// browser: after it saves DAYS_KEY, `loadJSON(DAYS_KEY, null)` will return a
// non-null value (even `{}` for a fresh install) so this body never runs again.
function loadDays(): DaysRecord {
  const existing = loadJSON<DaysRecord | null>(DAYS_KEY, null)
  if (existing) {
    const cleaned = stripBogusDays(existing)
    if (cleaned !== existing) saveJSON(DAYS_KEY, cleaned)
    return cleaned
  }

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
  const { dark, toggleDark } = useDarkMode()
  const { soundEnabled, toggleSound } = useSoundSettings()
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [bank, setBank] = useState<Logo[] | null>(null)
  const [bankError, setBankError] = useState<string | null>(null)

  // Fetch the logo bank from D1 once; the local LOGOS array no longer backs
  // the live game.
  useEffect(() => {
    if (bank !== null || bankError !== null) return
    fetchGameLogos()
      .then(setBank)
      .catch((error: unknown) =>
        setBankError(error instanceof Error ? error.message : String(error)),
      )
  }, [bank, bankError])

  const dayRecord = days[String(activeDayIndex)] ?? EMPTY_DAY
  const isToday = activeDayIndex === todayIndex

  // Persist per-day state whenever it changes.
  useEffect(() => {
    saveJSON(DAYS_KEY, days)
  }, [days])

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

  const logo = bank && bank.length > 0 ? pickLogo(bank, activeDayIndex) : null

  const history: Record<string, GameStatus> = {}
  const foundLogos: { dayIndex: number; logo: Logo; count: number }[] = []
  for (const [key, record] of Object.entries(days)) {
    if (record.status !== 'playing') {
      history[key] = record.status
    }
    if (record.status === 'won' && bank) {
      const dayIndex = Number(key)
      foundLogos.push({ dayIndex, logo: pickLogo(bank, dayIndex), count: MAX_TRIES + 1 - record.guesses.length })
    }
  }
  const streak = computeStreak(history, todayIndex)

  function submitGuess(text: string) {
    if (!logo || dayRecord.status !== 'playing' || !text.trim()) return
    const correct = isCorrectGuess(text, logo)
    const guesses = [...dayRecord.guesses, { text: text.trim(), correct }]
    const status: GameStatus = correct ? 'won' : guesses.length >= MAX_TRIES ? 'lost' : 'playing'
    setDays((prev) => ({ ...prev, [String(activeDayIndex)]: { guesses, status } }))
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
    bank: bank ?? [],
    bankError,
    bankLoading: bank === null && bankError === null,
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
    toggleDark,
    soundEnabled,
    toggleSound,
    history,
    foundLogos,
    streak,
    maxTries: MAX_TRIES,
  }
}
