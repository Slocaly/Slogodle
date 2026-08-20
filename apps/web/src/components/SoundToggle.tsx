import { m } from "../paraglide/messages.js";
import { SoundOffIcon } from "./icons/SoundOffIcon";
import { SoundOnIcon } from "./icons/SoundOnIcon";
import styles from "./SoundToggle.module.css";

interface SoundToggleProps {
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

export function SoundToggle({ soundEnabled, onSoundToggle }: SoundToggleProps) {
  const isSoundEnabled = soundEnabled
    ? m.sound_toggle_to_off()
    : m.sound_toggle_to_on();

  return (
    <button
      type="button"
      className={styles.soundToggle}
      aria-label={isSoundEnabled}
      onClick={onSoundToggle}
    >
      {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
    </button>
  );
}
