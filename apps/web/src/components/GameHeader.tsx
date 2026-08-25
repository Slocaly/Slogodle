import { m } from "../paraglide/messages.js";
import { AccountMenu } from "./AccountMenu";
import { ArchiveToggle } from "./ArchiveToggle";
import { DarkModeToggle } from "./DarkModeToggle";
import { SoundToggle } from "./SoundToggle";
import styles from "./GameHeader.module.css";

const TITLE_LETTER_COLORS = ["var(--title-1)", "var(--title-2)", "var(--title-3)"];
const TITLE_GROUP_SIZES = [3, 2, 3];

interface GameHeaderProps {
  onToggleArchive: () => void;
  dark: boolean;
  onToggleDark: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  playClick: () => void;
}

export function GameHeader({
  onToggleArchive,
  dark,
  onToggleDark,
  soundEnabled,
  onToggleSound,
  playClick,
}: GameHeaderProps) {
  const handleSoundToggle = () => {
    playClick();
    onToggleSound();
  };

  const handleArchiveToggle = () => {
    playClick();
    onToggleArchive();
  };

  const handleDarkToggle = () => {
    playClick();
    onToggleDark();
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        {(() => {
          const letters = [...m.site_title()];
          const groupEnds = TITLE_GROUP_SIZES.reduce<number[]>((ends, size) => {
            ends.push((ends.at(-1) ?? 0) + size);
            return ends;
          }, []);
          return letters.map((letter, i) => (
            <span
              key={i}
              style={{
                color:
                  TITLE_LETTER_COLORS[
                    groupEnds.findIndex((end) => i < end) % TITLE_LETTER_COLORS.length
                  ],
              }}
            >
              {letter}
            </span>
          ));
        })()}
      </h1>
      <div className={styles.headerActions}>
        <ArchiveToggle onToggleArchive={handleArchiveToggle} />
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
