import { m } from "../paraglide/messages.js";
import { AccountMenu } from "./AccountMenu";
import { ArchiveToggle } from "./ArchiveToggle";
import { DarkModeToggle } from "./DarkModeToggle";
import { SoundToggle } from "./SoundToggle";
import styles from "./GameHeader.module.css";

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
      <h1 className={styles.title}>{m.site_title()}</h1>
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
