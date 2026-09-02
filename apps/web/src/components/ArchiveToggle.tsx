import { m } from "../paraglide/messages.js";
import { ArchiveIcon } from "./icons/ArchiveIcon";
import styles from "./ArchiveToggle.module.css";

interface ArchiveToggleProps {
  onToggleArchive: () => void;
}

export function ArchiveToggle({ onToggleArchive }: ArchiveToggleProps) {
  return (
    <button type="button" className={styles.archiveToggle} onClick={onToggleArchive}>
      <ArchiveIcon />
      <span>{m.burger_history_label()}</span>
    </button>
  );
}
