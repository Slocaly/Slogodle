import { useSyncExternalStore } from 'react'
import { subscribe, getSnapshot, now, isSimulated, setSimulatedDate, nudgeDays, resetClock } from '../lib/clock'

export function useClock() {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return { now, isSimulated, setSimulatedDate, nudgeDays, resetClock }
}
