import { useEffect } from "react";
import { createSpeedAmbience } from "../lib/speed-ambience";

/** Plays the speed round's ambient bed while `active` and sound is enabled. */
export function useSpeedAmbience(active: boolean, soundEnabled: boolean) {
  const shouldPlay = active && soundEnabled;
  useEffect(() => {
    if (!shouldPlay) return;
    const ambience = createSpeedAmbience();
    ambience?.start();
    return () => ambience?.stop();
  }, [shouldPlay]);
}
