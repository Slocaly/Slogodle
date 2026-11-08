import { useEffect, useState } from "react";

const SEEN_KEY = "slogodle_speed_seen_v1";
const EVENT = "slogodle:speed-seen";

function readSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true; // storage blocked: don't nag with a badge we can't dismiss
  }
}

/** Mark Speed mode as discovered; clears every "NEW" badge. */
export function markSpeedSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(EVENT));
}

/** True until the player has opened Speed mode once. Starts false for SSR/hydration. */
export function useSpeedNew(): boolean {
  const [isNew, setIsNew] = useState(false);
  useEffect(() => {
    const sync = () => setIsNew(!readSeen());
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return isNew;
}
