// src/components/LoadingCard.tsx
import { m } from "../paraglide/messages.js";
import shared from "../styles/shared.module.css";
import { CrossIcon } from "./StatusIcons";
import styles from "./LoadingCard.module.css";

interface LoadingCardProps {
  variant: "loading" | "error" | "empty";
  errorMessage?: string;
}

export function LoadingCard({ variant, errorMessage }: LoadingCardProps) {
  return (
    <div
      className={shared.card}
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {variant === "loading" && (
        <div className={styles.dots} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      )}
      {variant === "error" && (
        <div className={styles.errorIcon} aria-hidden="true">
          <CrossIcon />
        </div>
      )}
      <p className={variant === "error" ? styles.errorText : styles.message}>
        {variant === "loading"
          ? m.loading_label()
          : variant === "error"
            ? errorMessage
            : m.loading_empty()}
      </p>
    </div>
  );
}
