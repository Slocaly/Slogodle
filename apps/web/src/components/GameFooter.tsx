import type { Ref } from "react";
import { Link } from "@tanstack/react-router";
import { m } from "../paraglide/messages.js";
import styles from "./GameFooter.module.css";

interface GameFooterProps {
  /** Ref to the actual solid bar, so the physics pile can rest pieces on its real rect. */
  ref?: Ref<HTMLDivElement>;
}

export function GameFooter({ ref }: GameFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.bar} ref={ref}>
        <p className={styles.copyright}>
          {m.footer_copyright({ year })}{" "}
          <a
            href="https://slocaly.dev"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            {m.footer_author()}
          </a>
        </p>
        <nav className={styles.legalLinks} aria-label={m.footer_legal_nav_label()}>
          <Link to="/mentions-legales" className={styles.link}>
            {m.footer_mentions_legales()}
          </Link>
          <Link to="/cgu" className={styles.link}>
            {m.footer_cgu()}
          </Link>
          <Link to="/confidentialite" className={styles.link}>
            {m.footer_confidentialite()}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
