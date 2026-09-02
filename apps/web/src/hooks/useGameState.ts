import { useEffect, useState } from 'react'
import type { Logo } from '@slogodle/logos'
import { loadJSON, saveJSON } from '../lib/storage'
import { now, subscribe as subscribeClock } from '../lib/clock'
import {
  dayIndexFor,
  pickLogo,
  computeStreak,
  computeBestStreak,
  resolveGuesses,
  rewardFor,
  MAX_TRIES,
  type Guess,
  type GameStatus,
} from '../lib/game-logic'
import { authClient } from '../lib/auth-client'
import { enqueueSync } from '../lib/progress'
import { useDarkMode } from './useDarkMode'
import { useSoundSettings } from './useSoundSettings'
import { useGameLogosQuery } from './useGameLogosQuery'
import { useRemoteProgress } from './useRemoteProgress'

const OLD_TODAY_KEY = 'logodle_today_v1'
const OLD_HISTORY_KEY = 'logodle_history_v1'
const DAYS_KEY = 'logodle_days_v2'

interface DayRecord {
  guesses: Guess[]
  status: GameStatus
  reward: number
  // Whether this day was resolved on the day the puzzle was actually for, as
  // opposed to played later via the archive. Only fresh wins count toward a
  // streak. Legacy/migrated records predate this field and default to true
  // so existing streaks aren't retroactively punished — see the DB column's
  // matching default in migrations/0006_add_played_fresh_to_progress.sql.
  playedFresh: boolean
}

type DaysRecord = Record<string, DayRecord>

interface OldSavedToday {
  dayIndex: number
  guesses: Guess[]
  status: GameStatus
}

const EMPTY_DAY: DayRecord = { guesses: [], status: 'playing', reward: 0, playedFresh: true }
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
    migrated[key] = { guesses: [], status, reward: 0, playedFresh: true }
  }
  const oldToday = loadJSON<OldSavedToday | null>(OLD_TODAY_KEY, null)
  if (oldToday) {
    migrated[String(oldToday.dayIndex)] = {
      guesses: oldToday.guesses,
      status: oldToday.status,
      reward: 0,
      playedFresh: true,
    }
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

  // Fetch the logo bank from D1; the local LOGOS array no longer backs the
  // live game.
  const bankQuery = useGameLogosQuery()
  const bank = bankQuery.data ?? null
  const bankError = bankQuery.error
    ? bankQuery.error instanceof Error
      ? bankQuery.error.message
      : String(bankQuery.error)
    : null

  const dayRecord = days[String(activeDayIndex)] ?? EMPTY_DAY
  const isToday = activeDayIndex === todayIndex

  // Persist per-day state whenever it changes.
  useEffect(() => {
    saveJSON(DAYS_KEY, days)
  }, [days])

  const session = authClient.useSession()
  const userId = session.data?.user.id
  const { data: remoteProgress, syncProgress } = useRemoteProgress(userId)

  // The moment a session exists (email/password sign-in, sign-up, or the
  // GitHub OAuth redirect landing back on this page), useRemoteProgress
  // claims any anonymous rows into the account and fetches D1's answer for
  // this user. This overwrite is the actual anti-tamper enforcement point:
  // anything in localStorage that D1 doesn't independently corroborate is
  // discarded.
  useEffect(() => {
    if (!remoteProgress) return
    setDays((prev) => {
      const next: DaysRecord = {}
      for (const [key, value] of Object.entries(remoteProgress)) {
        next[key] = {
          guesses: value.guesses,
          status: value.status,
          reward: value.reward,
          playedFresh: value.playedFresh,
        }
      }
      // D1 is authoritative for every day it has a row for. A day this
      // browser is still mid-guess on (status 'playing') has no D1 row
      // yet — enqueueSync only fires once a day resolves — so without
      // this, every mount with an active session would silently wipe
      // whatever guesses were made since the last successful sync,
      // and repeatedly reloading would hand the player fresh tries on
      // an already-started day. Preserve exactly those local-only
      // in-progress records; everything else comes from D1.
      for (const [key, record] of Object.entries(prev)) {
        if (record.status === 'playing' && !(key in next)) next[key] = record
      }
      return next
    })
  }, [remoteProgress])

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
  // A win only counts toward a streak if it was played on the day the puzzle
  // was for, not backfilled later via the archive — see DayRecord.playedFresh.
  const streakHistory: Record<string, GameStatus> = {}
  const dayGuesses: Record<string, Guess[]> = {}
  const dayPlayedFresh: Record<string, boolean> = {}
  const foundLogos: { dayIndex: number; logo: Logo; count: number }[] = []
  for (const [key, record] of Object.entries(days)) {
    if (record.status !== 'playing') {
      history[key] = record.status
      dayGuesses[key] = record.guesses
      const playedFresh = record.playedFresh ?? true
      dayPlayedFresh[key] = playedFresh
      streakHistory[key] = record.status === 'won' && !playedFresh ? 'lost' : record.status
    }
    if (record.status === 'won' && bank) {
      const dayIndex = Number(key)
      foundLogos.push({ dayIndex, logo: pickLogo(bank, dayIndex), count: record.reward })
    }
  }
  const streak = computeStreak(streakHistory, todayIndex)
  const bestStreak = computeBestStreak(streakHistory, todayIndex)

  function submitGuess(text: string) {
    if (!logo || dayRecord.status !== 'playing' || !text.trim()) return
    const priorTexts = dayRecord.guesses.map((g) => g.text)
    const { guesses, status } = resolveGuesses([...priorTexts, text.trim()], logo)
    const reward = rewardFor(status, guesses, isToday)
    setDays((prev) => ({
      ...prev,
      [String(activeDayIndex)]: { guesses, status, reward, playedFresh: isToday },
    }))
    if (status !== 'playing') {
      enqueueSync(activeDayIndex, guesses.map((g) => g.text))
      syncProgress()
    }
    return { status, attempts: guesses.length, reward }
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
    bankLoading: bankQuery.isPending,
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
    dayGuesses,
    dayPlayedFresh,
    foundLogos,
    streak,
    bestStreak,
    maxTries: MAX_TRIES,
    isConnected: !!userId,
  }
}
