import { m } from "../paraglide/messages.js";
import styles from "./NewBadge.module.css";

export function NewBadge() {
  return <span className={styles.badge}>{m.badge_new()}</span>;
}
