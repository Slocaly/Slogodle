import { useSyncExternalStore } from "react";

const SOUND_KEY = "logodle_sound_v1";

// Module-level store so every component calling the hook (e.g. the admin
// layout's header toggle and the page rendered in its <Outlet />) shares one
// value instead of each holding a stale copy.
let current: boolean | null = null;
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) === "1";
  } catch {
    return false;
  }
}

function getSnapshot(): boolean {
  current ??= read();
  return current;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function toggle() {
  current = !getSnapshot();
  try {
    localStorage.setItem(SOUND_KEY, current ? "1" : "0");
  } catch {
    // best-effort, matches useDarkMode behavior
  }
  listeners.forEach((l) => l());
}

export function useSoundSettings() {
  // Server snapshot is `false`; the client value is applied after hydration.
  const soundEnabled = useSyncExternalStore(subscribe, getSnapshot, () => false);
  return { soundEnabled, toggleSound: toggle };
}
