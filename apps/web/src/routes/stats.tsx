import { createFileRoute, Link } from "@tanstack/react-router";
import { useGameState } from "../hooks/useGameState";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { GameHeader } from "../components/GameHeader";
import { GameFooter } from "../components/GameFooter";
import { WinsByTriesChart } from "../components/WinsByTriesChart";
import type { Bucket } from "../components/chartBuckets";
import type { GameStatus, Guess } from "../lib/game-logic";
import { m } from "../paraglide/messages.js";
import shared from "../styles/shared.module.css";
import styles from "./stats.module.css";

export const Route = createFileRoute("/stats")({
  ssr: false,
  component: StatsPage,
});

function bucketCounts(
  history: Record<string, GameStatus>,
  dayGuesses: Record<string, Guess[]>,
  dayPlayedFresh: Record<string, boolean>,
): Record<Bucket, number> {
  const counts: Record<Bucket, number> = {
    "1 try": 0,
    "2 tries": 0,
    "3 tries": 0,
    "Historic win": 0,
    Failed: 0,
  };
  for (const [key, status] of Object.entries(history)) {
    if (status === "lost") {
      counts.Failed += 1;
      continue;
    }
    if (!dayPlayedFresh[key]) {
      counts["Historic win"] += 1;
      continue;
    }
    const tries = dayGuesses[key]?.length;
    if (tries === 1) counts["1 try"] += 1;
    else if (tries === 2) counts["2 tries"] += 1;
    else if (tries === 3) counts["3 tries"] += 1;
  }
  return counts;
}

function StatsPage() {
  const g = useGameState();
  const { playClick, playBubble } = useSoundEffects(g.soundEnabled);
  const playedDays = Object.keys(g.history).length;

  return (
    <div className={shared.page}>
      <GameHeader
        dark={g.dark}
        onToggleDark={g.toggleDark}
        soundEnabled={g.soundEnabled}
        onToggleSound={g.toggleSound}
        playClick={playClick}
        playBubble={playBubble}
        statsLinkTo="/"
      />

      <div className={styles.body}>
        <Link to="/" className={styles.backLink}>
          ← {m.stats_back_to_game()}
        </Link>

        <h1 className={styles.title}>{m.stats_title()}</h1>

        {!g.isConnected ? (
          <p className={styles.empty}>
            {m.stats_login_cta()}{" "}
            <Link to="/login" className={styles.loginLink}>
              {m.stats_login_link()}
            </Link>
          </p>
        ) : g.bankLoading ? (
          <p className={styles.empty}>{m.loading_label()}</p>
        ) : playedDays === 0 ? (
          <p className={styles.empty}>{m.stats_empty()}</p>
        ) : (
          <>
            <div className={styles.streakCard}>
              <span className={styles.streakLabel}>{m.stats_best_streak_label()}</span>
              <span className={styles.streakValue}>{g.bestStreak}</span>
              <span className={styles.streakUnit}>{m.stats_best_streak_unit()}</span>
            </div>

            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>{m.stats_chart_title()}</h2>
              <WinsByTriesChart
                counts={bucketCounts(g.history, g.dayGuesses, g.dayPlayedFresh)}
                dark={g.dark}
              />
            </div>
          </>
        )}
      </div>

      <GameFooter />
    </div>
  );
}
