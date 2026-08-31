import { useState } from 'react'
import { LOGOS, type Logo } from '@slogodle/logos'
import { now } from '../lib/clock'
import {
  dayIndexFor,
  resolveGuesses,
  MAX_TRIES,
  type Guess,
  type GameStatus,
} from '../lib/game-logic'
import { useDarkMode } from './useDarkMode'
import { useSoundSettings } from './useSoundSettings'

const PILE_SIZE = 3

// Deterministic per-day triplet, same idea as the main game's pickLogo but for
// `count` consecutive entries instead of one.
function pickPile(bank: Logo[], dayIndex: number, count: number): Logo[] {
  const start = ((dayIndex % bank.length) + bank.length) % bank.length
  return Array.from({ length: count }, (_, i) => bank[(start + i) % bank.length])
}

interface CardState {
  guesses: Guess[]
  status: GameStatus
}

const EMPTY_CARD: CardState = { guesses: [], status: 'playing' }

function initialCards(): CardState[] {
  return Array.from({ length: PILE_SIZE }, () => EMPTY_CARD)
}

export function useBetaGameState() {
  const { dark, toggleDark } = useDarkMode()
  const { soundEnabled, toggleSound } = useSoundSettings()

  const [logos] = useState<Logo[]>(() =>
    pickPile(LOGOS, dayIndexFor(now()), PILE_SIZE),
  )
  const [pileIndex, setPileIndex] = useState(0)
  const [cards, setCards] = useState<CardState[]>(initialCards)

  const activeLogo: Logo | null = logos[pileIndex] ?? null
  const activeCard = cards[pileIndex] ?? EMPTY_CARD
  const complete = pileIndex >= logos.length

  function submitGuess(text: string) {
    if (!activeLogo || activeCard.status !== 'playing' || !text.trim()) return
    const priorTexts = activeCard.guesses.map((g) => g.text)
    const { guesses, status } = resolveGuesses(
      [...priorTexts, text.trim()],
      activeLogo,
    )
    setCards((prev) => {
      const next = [...prev]
      next[pileIndex] = { guesses, status }
      return next
    })
    return { status }
  }

  function advance() {
    setPileIndex((i) => Math.min(i + 1, logos.length))
  }

  function goTo(index: number) {
    if (index < 0 || index >= logos.length) return
    setPileIndex(index)
  }

  function restart() {
    setPileIndex(0)
    setCards(initialCards())
  }

  return {
    bank: LOGOS,
    logos,
    pileIndex,
    activeLogo,
    guesses: activeCard.guesses,
    status: activeCard.status,
    complete,
    submitGuess,
    advance,
    goTo,
    restart,
    maxTries: MAX_TRIES,
    dark,
    toggleDark,
    soundEnabled,
    toggleSound,
  }
}
