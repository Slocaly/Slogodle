// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { useGameState } from "../hooks/useGameState";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { GameHeader } from "../components/GameHeader";
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
  const { playClick, playWrongGuess, playWin, playLose } = useSoundEffects(
    g.soundEnabled,
  );

  function handleGuess(text: string) {
    const result = g.submitGuess(text);
    if (result?.status === "won") {
      playWin();
      pileRef.current?.launchWin(g.maxTries + 1 - result.attempts);
    } else if (result?.status === "lost") {
      playLose();
    } else if (result?.status === "playing") {
      playWrongGuess();
    }
  }

  function handleFakeLaunch() {
    pileRef.current?.launchWin(g.maxTries);
  }

  function handleAddRandomLogos() {
    pileRef.current?.addRandomLogos(10);
  }

  function handleResetPileToFound() {
    pileRef.current?.resetToFound();
  }

  if (!g.logo) {
    const message = g.bankError
      ? `Failed to load logos: ${g.bankError}`
      : g.bankLoading
        ? "Loading…"
        : "No playable logos available yet.";
    return (
      <div className={shared.page}>
        <main className={shared.gameArea} id="main">
          <p>{message}</p>
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
      />
      <div className={shared.page}>
        <div className={styles.headerWrap}>
          <GameHeader
            onToggleArchive={g.toggleArchive}
            dark={g.dark}
            onToggleDark={g.toggleDark}
            soundEnabled={g.soundEnabled}
            onToggleSound={g.toggleSound}
            playClick={playClick}
          />
          <ArchivePanel
            open={g.archiveOpen}
            dayIndex={g.todayIndex}
            activeDayIndex={g.dayIndex}
            history={g.history}
            onSelectDay={g.viewDay}
            bank={g.bank}
          />
        </div>
        <main className={shared.gameArea} id="main">
          <div className={styles.cardStack}>
            {!isPlaying && g.isToday && <CountdownTimer />}
            {!g.isToday && <BackToTodayButton onBackToday={g.returnToToday} />}
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
      </div>
    </>
  );
}
