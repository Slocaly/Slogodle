import { getAnonId } from './anon-id'
import { loadJSON, saveJSON } from './storage'
import type { GameStatus, Guess } from './game-logic'

const OUTBOX_KEY = 'slogodle_pending_sync_v1'

interface OutboxEntry {
  dayIndex: number
  guesses: string[]
}

export interface RemoteDayRecord {
  status: GameStatus
  guesses: Guess[]
  reward: number
  playedFresh: boolean
}

function loadOutbox(): OutboxEntry[] {
  return loadJSON<OutboxEntry[]>(OUTBOX_KEY, [])
}

function saveOutbox(entries: OutboxEntry[]): void {
  saveJSON(OUTBOX_KEY, entries)
}

export function enqueueSync(dayIndex: number, guesses: string[]): void {
  const outbox = loadOutbox()
  if (outbox.some((entry) => entry.dayIndex === dayIndex)) return
  saveOutbox([...outbox, { dayIndex, guesses }])
  void flushOutbox()
}

export async function flushOutbox(): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return
  const outbox = loadOutbox()
  if (outbox.length === 0) return
  const anonId = getAnonId()
  const remaining: OutboxEntry[] = []
  for (const entry of outbox) {
    try {
      const res = await fetch('/api/progress/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonId, dayIndex: entry.dayIndex, guesses: entry.guesses }),
      })
      // Only retry on a server-side error — a 4xx means the server
      // rejected this specific payload (too old, future day, or doesn't
      // resolve the puzzle) and retrying it verbatim would never succeed;
      // keep it out of the outbox so a permanently-invalid entry doesn't
      // retry forever.
      if (!res.ok && res.status >= 500) remaining.push(entry)
    } catch {
      remaining.push(entry)
    }
  }
  saveOutbox(remaining)
}

export async function claimProgress(): Promise<void> {
  try {
    await fetch('/api/progress/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonId: getAnonId() }),
    })
  } catch {
    // best-effort; a failed claim just means D1 keeps the anon-tagged rows
    // for now, retried on the next session-change effect run
  }
}

export async function fetchMyProgress(): Promise<Record<string, RemoteDayRecord> | null> {
  try {
    const res = await fetch('/api/progress/mine')
    if (!res.ok) return null
    return (await res.json()) as Record<string, RemoteDayRecord>
  } catch {
    return null
  }
}
