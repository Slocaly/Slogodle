import { useState } from "react";
import { m } from "../paraglide/messages.js";
import { AccountMenu } from "./AccountMenu";
import { ArchiveToggle } from "./ArchiveToggle";
import { BurgerMenu } from "./BurgerMenu";
import { DarkModeToggle } from "./DarkModeToggle";
import { ModeSwitch } from "./ModeSwitch";
import { SoundToggle } from "./SoundToggle";
import { StatsLink } from "./StatsLink";
import styles from "./GameHeader.module.css";

const TITLE_LETTER_COLORS = [
  "var(--title-1)",
  "var(--title-2)",
  "var(--title-3)",
];
const TITLE_GROUP_SIZES = [3, 2, 3];
const LETTER_STAGGER_MS = 100;
const BUBBLE_PITCH_STEP = 0.1;

interface GameHeaderProps {
  onToggleArchive?: () => void;
  /** Shows the History pill as a link to this page instead of an archive toggle. */
  historyLinkTo?: "/speed/history";
  statsLinkTo?: "/admin/stats" | "/admin" | "/stats" | "/" | "/speed";
  streak?: number;
  dark: boolean;
  onToggleDark: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  playClick: () => void;
  playBubble: (options?: { playbackRate?: number }) => void;
}

export function GameHeader({
  onToggleArchive,
  historyLinkTo,
  statsLinkTo,
  streak,
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

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        <button
          type="button"
          className={styles.titleButton}
          aria-label={m.site_title()}
          onClick={handleTitleActivate}
        >
          {(() => {
            const letters = [...m.site_title()];
            const groupEnds: number[] = [];
            for (const size of TITLE_GROUP_SIZES) {
              groupEnds.push((groupEnds.at(-1) ?? 0) + size);
            }
            return letters.map((letter, i) => (
              <span
                key={`${i}-${bounceKey}`}
                className={bounceKey > 0 ? styles.bounceLetter : undefined}
                style={{
                  animationDelay:
                    bounceKey > 0 ? `${i * LETTER_STAGGER_MS}ms` : undefined,
                  color:
                    TITLE_LETTER_COLORS[
                      groupEnds.findIndex((end) => i < end) %
                        TITLE_LETTER_COLORS.length
                    ],
                }}
              >
                {letter}
              </span>
            ));
          })()}
        </button>
      </h1>
      <div className={styles.headerActions}>
        <div className={styles.desktopActions}>
          <ModeSwitch />
          {onToggleArchive && (
            <ArchiveToggle onToggleArchive={handleArchiveToggle} />
          )}
          {historyLinkTo && <ArchiveToggle to={historyLinkTo} />}
          {statsLinkTo && <StatsLink to={statsLinkTo} streak={streak} />}
        </div>
        <SoundToggle
          soundEnabled={soundEnabled}
          onSoundToggle={handleSoundToggle}
        />
        <DarkModeToggle dark={dark} onDarkModeToggle={handleDarkToggle} />
        <div className={styles.desktopActions}>
          <AccountMenu />
        </div>
        <div className={styles.mobileActions}>
          <BurgerMenu streak={streak} />
        </div>
      </div>
    </header>
  );
}
