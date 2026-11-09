import { useSyncExternalStore } from "react";
import {
  getSnapshot,
  isSimulated,
  now,
  nudgeDays,
  resetClock,
  setSimulatedDate,
  subscribe,
} from "../lib/clock";

export function useClock() {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { isSimulated, now, nudgeDays, resetClock, setSimulatedDate };
}
