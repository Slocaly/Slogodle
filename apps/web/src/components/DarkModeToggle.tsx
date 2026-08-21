import { m } from "../paraglide/messages.js";
import { MoonIcon } from "./icons/MoonIcon";
import { SunIcon } from "./icons/SunIcon";
import styles from "./DarkModeToggle.module.css";

interface DarkModeToggleProps {
  dark: boolean;
  onDarkModeToggle: () => void;
}

export function DarkModeToggle({
  dark,
  onDarkModeToggle,
}: DarkModeToggleProps) {
  return (
    <button
      type="button"
      className={styles.darkToggle}
      aria-label={dark ? m.theme_toggle_to_light() : m.theme_toggle_to_dark()}
      onClick={onDarkModeToggle}
    >
      {dark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
