import { useState } from "react";
import type { Logo } from "@slogodle/logos";
import { Link } from "@tanstack/react-router";
import { buildShareText, type GameStatus, type Guess } from "../lib/game-logic";
import { authClient } from "../lib/auth-client";
import { m } from "../paraglide/messages.js";
import shared from "../styles/shared.module.css";
import { GithubIcon } from "./icons/GithubIcon";
import { ShareIcon } from "./icons/ShareIcon";
import { UserIcon } from "./icons/UserIcon";
import styles from "./RevealPanel.module.css";

interface RevealPanelProps {
  logo: Logo;
  dayIndex: number;
  guesses: Guess[];
  status: GameStatus;
  maxTries: number;
  playClick: () => void;
  /** Show the description/fun-fact blurb. Defaults to true. */
  showDetails?: boolean;
}

export function RevealPanel({
  logo,
  dayIndex,
  guesses,
  status,
  maxTries,
  playClick,
  showDetails = true,
}: RevealPanelProps) {
  const [copied, setCopied] = useState(false);
  const { data: session, isPending } = authClient.useSession();

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
      {showDetails && (
        <>
          <div className={styles.revealDescription}>{logo.description}</div>
          <div className={shared.revealFact}>{logo.funFact}</div>
        </>
      )}
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
        {!isPending && !session && (
          <Link to="/signup" className={styles.loginCtaBtn}>
            <UserIcon />
            <span>{m.reveal_login_cta()}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
