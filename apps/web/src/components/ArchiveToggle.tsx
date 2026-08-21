import { m } from "../paraglide/messages.js";
import { ArchiveIcon } from "./icons/ArchiveIcon";
import styles from "./ArchiveToggle.module.css";

interface ArchiveToggleProps {
  onToggleArchive: () => void;
}

export function ArchiveToggle({ onToggleArchive }: ArchiveToggleProps) {
  return (
    <button
      type="button"
      className={styles.archiveToggle}
      aria-label={m.archive_toggle()}
      onClick={onToggleArchive}
    >
      <ArchiveIcon />
    </button>
  );
}
