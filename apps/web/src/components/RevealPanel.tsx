import { useState } from "react";
import type { Logo } from "@slogodle/logos";
import { buildShareText, type GameStatus, type Guess } from "../lib/game-logic";
import { m } from "../paraglide/messages.js";
import shared from "../styles/shared.module.css";
import { GithubIcon } from "./icons/GithubIcon";
import { ShareIcon } from "./icons/ShareIcon";
import styles from "./RevealPanel.module.css";

interface RevealPanelProps {
  logo: Logo;
  dayIndex: number;
  guesses: Guess[];
  status: GameStatus;
  maxTries: number;
  playClick: () => void;
}

export function RevealPanel({
  logo,
  dayIndex,
  guesses,
  status,
  maxTries,
  playClick,
}: RevealPanelProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    playClick();
    const text = buildShareText({
      intro: status === "won" ? m.share_intro_won() : m.share_intro_lost(),
      title: m.site_title(),
      dayIndex,
      guesses,
      status,
      maxTries,
      origin: window.location.origin,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (unsupported browser or missing permission); nothing to fall back to
    }
  }

  return (
    <div className={styles.reveal}>
      <div className={shared.revealFact}>{logo.funFact}</div>
      <div className={styles.actionsRow}>
        <a
          className={styles.githubLinkBtn}
          href={logo.gitLink}
          target="_blank"
          rel="noreferrer noopener"
        >
          <GithubIcon />
          <span>{m.reveal_github_cta()}</span>
        </a>
        <button type="button" className={styles.shareBtn} onClick={handleShare}>
          <ShareIcon />
          <span>{copied ? m.share_copied() : m.share_button()}</span>
        </button>
      </div>
    </div>
  );
}
