// src/components/LogoCard.tsx
import type { Logo } from "@slogodle/logos";
import type { GameStatus, Guess } from "../lib/game-logic";
import { m } from "../paraglide/messages.js";
import shared from "../styles/shared.module.css";
import styles from "./LogoCard.module.css";
import { GuessDots } from "./GuessDots";
import { StatusBadge } from "./StatusBadge";

interface LogoCardProps {
  dayIndex: number;
  status: GameStatus;
  logo: Logo;
  guesses: Guess[];
  maxTries: number;
}

const MASK_CHARS = ["*", "x", "|"];

function maskName(name: string): string {
  let i = 0;
  return name.replace(
    /[A-Za-z0-9]/g,
    () => MASK_CHARS[i++ % MASK_CHARS.length],
  );
}

function getLabel(status: GameStatus, dayIndex: number) {
  const day = dayIndex + 1;
  if (status === "playing") return m.logo_label_playing({ day });
  if (status === "won") return m.logo_label_solved({ day });
  return m.logo_label_missed({ day });
}

export function LogoCard({
  dayIndex,
  status,
  logo,
  guesses,
  maxTries,
}: LogoCardProps) {
  const isRevealed = status !== "playing";
  const isPlaying = status === "playing";
  const isWon = status === "won";
  const label = getLabel(status, dayIndex);

  const alt = isPlaying
    ? m.logo_alt_playing()
    : m.logo_alt_revealed({ name: logo.name });

  return (
    <>
      <div className={styles.topRow}>
        <div className={`${shared.dayLabel} ${styles.dayLabelCorner}`}>
          {label}
        </div>
        <GuessDots guesses={guesses} maxTries={maxTries} />
        {isRevealed && <StatusBadge isWon={isWon} />}
      </div>
      <div className={styles.nameRow}>
        <span
          className={styles.nameText}
          data-revealed={isRevealed}
          aria-hidden={!isRevealed}
        >
          {isRevealed ? logo.name : maskName(logo.name)}
        </span>
      </div>
      <div className={styles.logoWrap}>
        <img
          className={styles.logoSvg}
          width="100"
          height="100"
          src={logo.icon}
          alt={alt}
          data-status={status}
        />
      </div>
    </>
  );
}
