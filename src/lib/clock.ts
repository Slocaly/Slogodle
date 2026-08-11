type Listener = () => void

let offsetMs = 0
const listeners = new Set<Listener>()

function emitChange() {
  for (const listener of listeners) listener()
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): number {
  return offsetMs
}

export function now(): Date {
  return new Date(Date.now() + offsetMs)
}

export function isSimulated(): boolean {
  return offsetMs !== 0
}

function applyOffset(targetDate: Date) {
  offsetMs = targetDate.getTime() - Date.now()
  emitChange()
}

export function setSimulatedDate(date: Date): void {
  if (!import.meta.env.DEV) return
  applyOffset(date)
}

export function nudgeDays(n: number): void {
  if (!import.meta.env.DEV) return
  applyOffset(new Date(now().getTime() + n * 86400000))
}

export function resetClock(): void {
  if (!import.meta.env.DEV) return
  offsetMs = 0
  emitChange()
}
