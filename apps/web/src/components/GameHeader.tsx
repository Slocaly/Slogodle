import { useState } from "react";
import { m } from "../paraglide/messages.js";
import { AccountMenu } from "./AccountMenu";
import { ArchiveToggle } from "./ArchiveToggle";
import { DarkModeToggle } from "./DarkModeToggle";
import { SoundToggle } from "./SoundToggle";
import { StatsLink } from "./StatsLink";
import styles from "./GameHeader.module.css";

const TITLE_LETTER_COLORS = ["var(--title-1)", "var(--title-2)", "var(--title-3)"];
const TITLE_GROUP_SIZES = [3, 2, 3];
const LETTER_STAGGER_MS = 100;
const BUBBLE_PITCH_STEP = 0.1;

interface GameHeaderProps {
  onToggleArchive?: () => void;
  statsLinkTo?: "/admin/stats" | "/admin";
  dark: boolean;
  onToggleDark: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  playClick: () => void;
  playBubble: (options?: { playbackRate?: number }) => void;
}

export function GameHeader({
  onToggleArchive,
  statsLinkTo,
  dark,
  onToggleDark,
  soundEnabled,
  onToggleSound,
  playClick,
  playBubble,
}: GameHeaderProps) {
  const [bounceKey, setBounceKey] = useState(0);

  const handleSoundToggle = () => {
    playClick();
    onToggleSound();
  };

  const handleArchiveToggle = () => {
    playClick();
    onToggleArchive?.();
  };

  const handleDarkToggle = () => {
    playClick();
    onToggleDark();
  };

  const handleTitleActivate = () => {
    const letterCount = [...m.site_title()].length;
    setBounceKey((key) => key + 1);
    for (let i = 0; i < letterCount; i++) {
      setTimeout(
        () => playBubble({ playbackRate: 1 + i * BUBBLE_PITCH_STEP }),
        i * LETTER_STAGGER_MS,
      );
    }
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTitleActivate();
    }
  };

  return (
    <header className={styles.header}>
      <h1
        className={styles.title}
        role="button"
        tabIndex={0}
        aria-label={m.site_title()}
        onClick={handleTitleActivate}
        onKeyDown={handleTitleKeyDown}
      >
        {(() => {
          const letters = [...m.site_title()];
          const groupEnds = TITLE_GROUP_SIZES.reduce<number[]>((ends, size) => {
            ends.push((ends.at(-1) ?? 0) + size);
            return ends;
          }, []);
          return letters.map((letter, i) => (
            <span
              key={`${i}-${bounceKey}`}
              className={bounceKey > 0 ? styles.bounceLetter : undefined}
              style={{
                color:
                  TITLE_LETTER_COLORS[
                    groupEnds.findIndex((end) => i < end) % TITLE_LETTER_COLORS.length
                  ],
                animationDelay:
                  bounceKey > 0 ? `${i * LETTER_STAGGER_MS}ms` : undefined,
              }}
            >
              {letter}
            </span>
          ));
        })()}
      </h1>
      <div className={styles.headerActions}>
        {onToggleArchive && <ArchiveToggle onToggleArchive={handleArchiveToggle} />}
        {statsLinkTo && <StatsLink to={statsLinkTo} />}
        <SoundToggle
          soundEnabled={soundEnabled}
          onSoundToggle={handleSoundToggle}
        />
        <DarkModeToggle dark={dark} onDarkModeToggle={handleDarkToggle} />
        <AccountMenu />
      </div>
    </header>
  );
}
