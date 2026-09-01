import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useDarkMode } from "../hooks/useDarkMode";
import { useSoundSettings } from "../hooks/useSoundSettings";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { m } from "../paraglide/messages.js";
import { GameHeader } from "./GameHeader";
import { GameFooter } from "./GameFooter";
import shared from "../styles/shared.module.css";
import styles from "./LegalPage.module.css";

interface LegalPageProps {
  title: string;
  children: ReactNode;
}

export function LegalPage({ title, children }: LegalPageProps) {
  const { dark, toggleDark } = useDarkMode();
  const { soundEnabled, toggleSound } = useSoundSettings();
  const { playClick, playBubble } = useSoundEffects(soundEnabled);

  return (
    <div className={shared.page}>
      <GameHeader
        dark={dark}
        onToggleDark={toggleDark}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        playClick={playClick}
        playBubble={playBubble}
      />

      <div className={styles.body}>
        <Link to="/" className={styles.backLink}>
          {m.legal_back_to_game()}
        </Link>

        <h1 className={styles.title}>{title}</h1>
        <div className={styles.text}>{children}</div>
      </div>

      <GameFooter />
    </div>
  );
}
