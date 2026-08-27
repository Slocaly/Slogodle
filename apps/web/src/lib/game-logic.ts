import type { Logo } from '@slogodle/logos'

const EPOCH = new Date(2024, 0, 1)

export type GameStatus = 'playing' | 'won' | 'lost'

export interface Guess {
  text: string
  correct: boolean
}

export const MAX_TRIES = 3
export const ARCHIVE_DAYS = 5

function localMidnight(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function dayIndexFor(date: Date, epoch: Date = EPOCH): number {
  const ms = localMidnight(date).getTime() - localMidnight(epoch).getTime()
  return Math.floor(ms / 86400000)
}

export function pickLogo(bank: Logo[], dayIndex: number): Logo {
  const i = ((dayIndex % bank.length) + bank.length) % bank.length
  return bank[i]
}

export function isCorrectGuess(text: string, logo: Logo): boolean {
  const q = text.trim().toLowerCase()
  return logo.name.toLowerCase() === q
}

export function resolveGuesses(texts: string[], logo: Logo): { guesses: Guess[]; status: GameStatus } {
  const guesses: Guess[] = []
  for (const text of texts.slice(0, MAX_TRIES)) {
    const correct = isCorrectGuess(text, logo)
    guesses.push({ text, correct })
    if (correct) break
  }
  const last = guesses[guesses.length - 1]
  const status: GameStatus = last?.correct ? 'won' : guesses.length >= MAX_TRIES ? 'lost' : 'playing'
  return { guesses, status }
}

export function rewardFor(status: GameStatus, guesses: Guess[], isFreshToday: boolean): number {
  if (status !== 'won') return 0
  return isFreshToday ? MAX_TRIES + 1 - guesses.length : 1
}

export function suggestionsFor(value: string, bank: Logo[], excludeName: string | null): { label: string; value: string }[] {
  if (!value || value.trim().length < 1) return []
  const q = value.trim().toLowerCase()
  return bank
    .map((l) => ({ label: l.name, value: l.name }))
    .filter((logo) => logo.label.toLowerCase().startsWith(q) && logo.label !== excludeName)
}

export function formatCountdown(ms: number): string {
  const clamped = Math.max(0, ms)
  const s = Math.floor(clamped / 1000)
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export function nextLocalMidnight(from: Date = new Date()): Date {
  const d = localMidnight(from)
  d.setDate(d.getDate() + 1)
  return d
}

export function computeStreak(history: Record<string, GameStatus>, todayIndex: number): number {
  let i = todayIndex
  if (history[String(i)] === undefined) i -= 1
  let streak = 0
  while (history[String(i)] === 'won') {
    streak += 1
    i -= 1
  }
  return streak
}

export function buildShareText(params: {
  intro: string
  title: string
  dayIndex: number
  guesses: Guess[]
  status: GameStatus
  maxTries: number
  origin: string
}): string {
  const { intro, title, dayIndex, guesses, status, maxTries, origin } = params
  const score = status === 'won' ? `${guesses.length}/${maxTries}` : `X/${maxTries}`
  const grid = guesses.map((g) => (g.correct ? '🟩' : '🟥')).join('')
  return `${intro}\n${title} #${dayIndex + 1} ${score}\n\n${grid}\n\n${origin}`
}
