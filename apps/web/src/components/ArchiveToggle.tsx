import { Link } from "@tanstack/react-router";
import { m } from "../paraglide/messages.js";
import { ArchiveIcon } from "./icons/ArchiveIcon";
import styles from "./ArchiveToggle.module.css";

type ArchiveToggleProps =
  | { onToggleArchive: () => void; to?: undefined }
  | { to: "/speed/history"; onToggleArchive?: undefined };

/** Header "History" pill: opens the archive panel, or links to a history page. */
export function ArchiveToggle({ onToggleArchive, to }: ArchiveToggleProps) {
  const content = (
    <>
      <ArchiveIcon />
      <span>{m.burger_history_label()}</span>
    </>
  );
  if (to) {
    return (
      <Link to={to} className={styles.archiveToggle}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={styles.archiveToggle} onClick={onToggleArchive}>
      {content}
    </button>
  );
}
