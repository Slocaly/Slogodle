import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useBetaGameState } from "../hooks/useBetaGameState";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { fetchIsAdmin } from "../lib/session";
import { GameHeader } from "../components/GameHeader";
import { LogoCardPile } from "../components/LogoCardPile";
import { GuessTiles } from "../components/GuessTiles";
import { GuessForm } from "../components/GuessForm";
import { RevealPanel } from "../components/RevealPanel";
import shared from "../styles/shared.module.css";
import indexStyles from "./index.module.css";
import styles from "./beta.module.css";

export const Route = createFileRoute("/beta")({
  ssr: false,
  beforeLoad: async () => {
    const isAdmin = await fetchIsAdmin();
    if (!isAdmin) {
      throw notFound();
    }
  },
  component: BetaPage,
});

function BetaPage() {
  const g = useBetaGameState();
  const { playClick, playWrongGuess, playWin, playLose, playBubble } =
    useSoundEffects(g.soundEnabled);

  function handleGuess(text: string) {
    const result = g.submitGuess(text);
    if (result?.status === "won") playWin();
    else if (result?.status === "lost") playLose();
    else if (result?.status === "playing") playWrongGuess();
  }

  const isPlaying = g.status === "playing";
  const isLastCard = g.pileIndex + 1 >= g.logos.length;

  return (
    <div className={shared.page}>
      <div className={indexStyles.headerWrap}>
        <GameHeader
          dark={g.dark}
          onToggleDark={g.toggleDark}
          soundEnabled={g.soundEnabled}
          onToggleSound={g.toggleSound}
          playClick={playClick}
          playBubble={playBubble}
        />
      </div>
      <Link to="/" className={styles.backLink}>
        ← Back to game
      </Link>
      <main className={shared.gameArea} id="main">
        {g.complete ? (
          <div className={shared.card}>
            <h2 className={styles.completeTitle}>Beta round complete</h2>
            <button
              type="button"
              className={styles.restartBtn}
              onClick={g.restart}
            >
              Restart
            </button>
          </div>
        ) : (
          <div className={styles.pileWrap}>
            <LogoCardPile
              logos={g.logos}
              pileIndex={g.pileIndex}
              status={g.status}
              guesses={g.guesses}
              maxTries={g.maxTries}
              onSelect={g.goTo}
            >
              <GuessTiles guesses={g.guesses} />
              {isPlaying ? (
                <GuessForm
                  key={g.pileIndex}
                  onSubmit={handleGuess}
                  logo={g.activeLogo!}
                  attemptCount={g.guesses.length}
                  bank={g.bank}
                />
              ) : (
                <>
                  <RevealPanel
                    logo={g.activeLogo!}
                    dayIndex={g.pileIndex}
                    guesses={g.guesses}
                    status={g.status}
                    maxTries={g.maxTries}
                    playClick={playClick}
                    showDetails={false}
                  />
                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={g.advance}
                  >
                    {isLastCard ? "Finish" : "Next logo →"}
                  </button>
                </>
              )}
            </LogoCardPile>
          </div>
        )}
      </main>
    </div>
  );
}
