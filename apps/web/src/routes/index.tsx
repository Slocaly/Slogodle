// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useGameState } from "../hooks/useGameState";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { m } from "../paraglide/messages.js";
import { GameHeader } from "../components/GameHeader";
import { GameFooter } from "../components/GameFooter";
import { LoadingCard } from "../components/LoadingCard";
import { ArchivePanel } from "../components/ArchivePanel";
import {
  PhysicsLogoPile,
  type PhysicsLogoPileHandle,
} from "../components/PhysicsLogoPile";
import { LogoCard } from "../components/LogoCard";
import { GuessTiles } from "../components/GuessTiles";
import { GuessForm } from "../components/GuessForm";
import { RevealPanel } from "../components/RevealPanel";
import { CountdownTimer } from "../components/CountdownTimer";
import { BackToTodayButton } from "../components/BackToTodayButton";
import { DevtoolsPanel } from "../components/DevtoolsPanel";
import shared from "../styles/shared.module.css";
import styles from "./index.module.css";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Home,
});

function Home() {
  const g = useGameState();
  const pileRef = useRef<PhysicsLogoPileHandle>(null);
  const footerBarRef = useRef<HTMLDivElement>(null);
  const { playClick, playWrongGuess, playWin, playLose, playBubble } = useSoundEffects(
    g.soundEnabled,
  );

  // Deep link from the history page: /?day=N jumps straight to that day,
  // then the param is cleared so it doesn't stick around in the URL.
  const [dayParam, setDayParam] = useQueryState("day", parseAsInteger);
  useEffect(() => {
    if (dayParam == null) return;
    g.viewDay(dayParam);
    void setDayParam(null);
  }, [dayParam]);

  function handleGuess(text: string) {
    const result = g.submitGuess(text);
    if (result?.status === "won") {
      playWin();
      pileRef.current?.launchWin(result.reward);
    } else if (result?.status === "lost") {
      playLose();
    } else if (result?.status === "playing") {
      playWrongGuess();
    }
  }

  function handleFakeLaunch() {
    pileRef.current?.launchWin(g.maxTries);
  }

  function handlePrevDay() {
    g.viewDay(g.dayIndex - 1);
  }

  function handleNextDay() {
    if (g.dayIndex + 1 >= g.todayIndex) {
      g.returnToToday();
    } else {
      g.viewDay(g.dayIndex + 1);
    }
  }

  function handleAddRandomLogos() {
    pileRef.current?.addRandomLogos(10);
  }

  function handleResetPileToFound() {
    pileRef.current?.resetToFound();
  }

  if (!g.logo) {
    return (
      <div className={shared.page}>
        <main className={shared.gameArea} id="main">
          {g.bankError ? (
            <LoadingCard
              variant="error"
              errorMessage={m.loading_error({ error: g.bankError })}
            />
          ) : (
            <LoadingCard variant={g.bankLoading ? "loading" : "empty"} />
          )}
        </main>
      </div>
    );
  }

  const isPlaying = g.status === "playing";

  return (
    <>
      <PhysicsLogoPile
        ref={pileRef}
        dayIndex={g.dayIndex}
        logo={g.logo}
        foundLogos={g.foundLogos}
        bank={g.bank}
        footerRef={footerBarRef}
      />
      <div className={shared.page}>
        <div className={styles.headerWrap}>
          <GameHeader
            onToggleArchive={g.toggleArchive}
            statsLinkTo="/stats"
            streak={g.streak}
            dark={g.dark}
            onToggleDark={g.toggleDark}
            soundEnabled={g.soundEnabled}
            onToggleSound={g.toggleSound}
            playClick={playClick}
            playBubble={playBubble}
          />
          <ArchivePanel
            open={g.archiveOpen}
            dayIndex={g.todayIndex}
            activeDayIndex={g.dayIndex}
            history={g.history}
            onSelectDay={g.viewDay}
            bank={g.bank}
            unlimited={g.isConnected}
          />
        </div>
        <main className={shared.gameArea} id="main">
          <div className={styles.cardStack}>
            {!isPlaying && g.isToday && <CountdownTimer />}
            {!g.isToday && (
              <BackToTodayButton
                dayIndex={g.dayIndex}
                todayIndex={g.todayIndex}
                onBackToday={g.returnToToday}
                onPrevDay={handlePrevDay}
                onNextDay={handleNextDay}
              />
            )}
            <div className={shared.card}>
              <LogoCard
                dayIndex={g.dayIndex}
                status={g.status}
                logo={g.logo}
                guesses={g.guesses}
                maxTries={g.maxTries}
              />
              <GuessTiles guesses={g.guesses} />
              {isPlaying && (
                <GuessForm
                  key={g.dayIndex}
                  onSubmit={handleGuess}
                  logo={g.logo}
                  attemptCount={g.guesses.length}
                  bank={g.bank}
                />
              )}
              {!isPlaying && (
                <RevealPanel
                  logo={g.logo}
                  dayIndex={g.dayIndex}
                  guesses={g.guesses}
                  status={g.status}
                  maxTries={g.maxTries}
                  playClick={playClick}
                />
              )}
            </div>
          </div>
        </main>
        {import.meta.env.DEV && (
          <DevtoolsPanel
            onResetDay={g.resetDay}
            onFakeLaunch={handleFakeLaunch}
            onAddRandomLogos={handleAddRandomLogos}
            onResetPileToFound={handleResetPileToFound}
          />
        )}
        <GameFooter ref={footerBarRef} />
      </div>
    </>
  );
}
