import { createFileRoute, Link } from "@tanstack/react-router";
import { useGameState } from "../hooks/useGameState";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { GameHeader } from "../components/GameHeader";
import { STATUS_META } from "../components/ArchiveDayButton";
import { GuessDots } from "../components/GuessDots";
import { GithubIcon } from "../components/icons/GithubIcon";
import { pickLogo } from "../lib/game-logic";
import { m } from "../paraglide/messages.js";
import dayStyles from "../components/ArchiveDayButton.module.css";
import shared from "../styles/shared.module.css";
import styles from "./history.module.css";

export const Route = createFileRoute("/history")({
  ssr: false,
  component: HistoryPage,
});

function HistoryPage() {
  const g = useGameState();
  const { playClick, playBubble } = useSoundEffects(g.soundEnabled);
  const dayIndices = Array.from({ length: g.todayIndex }, (_, i) => g.todayIndex - 1 - i);

  return (
    <div className={shared.page}>
      <GameHeader
        dark={g.dark}
        onToggleDark={g.toggleDark}
        soundEnabled={g.soundEnabled}
        onToggleSound={g.toggleSound}
        playClick={playClick}
        playBubble={playBubble}
      />

      <div className={styles.body}>
        <Link to="/" className={styles.backLink}>
          ← {m.history_back_to_game()}
        </Link>

        <h1 className={styles.title}>{m.history_title()}</h1>

        {!g.isConnected ? (
          <p className={styles.empty}>
            {m.history_login_cta()}{" "}
            <Link to="/login" className={styles.loginLink}>
              {m.history_login_link()}
            </Link>
          </p>
        ) : g.bankLoading ? (
          <p className={styles.empty}>{m.loading_label()}</p>
        ) : dayIndices.length === 0 ? (
          <p className={styles.empty}>{m.history_empty()}</p>
        ) : (
          <div className={styles.grid}>
            {dayIndices.map((idx) => {
              const status = g.history[String(idx)];
              const isPlayed = status === "won" || status === "lost";
              const { dotClass, label } = STATUS_META[isPlayed ? status : "unplayed"];
              // A finished day (won or lost) reveals its logo; only a truly
              // unplayed day gets the blurred placeholder so the answer
              // stays hidden.
              const logo = isPlayed ? pickLogo(g.bank, idx) : null;
              return (
                <div key={idx} className={styles.card}>
                  <span
                    className={`${styles.cardDot} ${dayStyles.archiveDot} ${dayStyles[dotClass]}`}
                    role="img"
                    aria-label={label()}
                  />
                  {logo && (
                    <a
                      href={logo.gitLink}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={styles.cardGithub}
                      aria-label={m.reveal_github_cta()}
                    >
                      <GithubIcon />
                    </a>
                  )}
                  {/* A plain anchor (not TanStack's <Link>) because the day is
                      passed as a `day` query param that nuqs reads on `/` —
                      nuqs deliberately manages search params outside the
                      router's typed `search` prop, so there's no route search
                      schema to target with a typed Link here. */}
                  <a href={`/?day=${idx}`} className={styles.cardLink}>
                    <span className={styles.cardArt}>
                      {logo ? (
                        <img className={styles.cardImg} src={logo.icon} alt={logo.name} />
                      ) : (
                        <span className={styles.cardBlur} data-hue={idx % 3} />
                      )}
                    </span>
                    <span className={styles.cardDay}>#{idx + 1}</span>
                    <span className={styles.cardName}>{logo ? logo.name : "???"}</span>
                    <span
                      className={`${styles.cardMeta} ${logo ? "" : styles.cardMetaHidden}`}
                      title={logo ? logo.industry : undefined}
                    >
                      {logo ? logo.industry : " "}
                    </span>
                    <GuessDots
                      guesses={logo ? g.dayGuesses[String(idx)] : []}
                      maxTries={g.maxTries}
                      className={styles.cardDots}
                    />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
