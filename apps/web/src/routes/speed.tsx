import { useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GameHeader } from "../components/GameHeader";
import { GameFooter } from "../components/GameFooter";
import { LoadingCard } from "../components/LoadingCard";
import { SpeedLadder } from "../components/SpeedLadder";
import { SpeedGame, type SpeedRemote } from "../components/SpeedGame";
import { useGameState } from "../hooks/useGameState";
import { markSpeedSeen } from "../hooks/useSpeedNew";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { useGameLogosQuery } from "../hooks/useGameLogosQuery";
import { getAnonId } from "../lib/anon-id";
import { now } from "../lib/clock";
import { dayIndexFor } from "../lib/game-logic";
import { SPEED_ROUND_SIZE, dailySpeedLogos } from "../lib/speed";
import {
  fetchSpeedRun,
  finishSpeedRun,
  startSpeedRun,
  type SpeedRunState,
} from "../lib/speed-runs";
import styles from "./speed.module.css";

export const Route = createFileRoute("/speed")({
  ssr: false,
  component: SpeedPage,
});

function SpeedPage() {
  useEffect(() => {
    markSpeedSeen();
  }, []);
  const g = useGameState();
  const { playClick, playBubble } = useSoundEffects(g.soundEnabled);
  const { data: bank } = useGameLogosQuery();
  const dayIndex = dayIndexFor(now());
  const queryClient = useQueryClient();
  const runQuery = useQuery({
    queryKey: ["speed-run", dayIndex],
    queryFn: async () => {
      const state = await fetchSpeedRun({ data: { anonId: getAnonId(), dayIndex } });
      return { state, clockOffset: state.serverNow - Date.now() };
    },
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
  const logos = useMemo(
    () => (bank ? dailySpeedLogos(bank, dayIndex) : []),
    [bank, dayIndex],
  );

  return (
    <div className={styles.page}>
      <GameHeader
        streak={g.streak}
        dark={g.dark}
        onToggleDark={g.toggleDark}
        soundEnabled={g.soundEnabled}
        onToggleSound={g.toggleSound}
        playClick={playClick}
        playBubble={playBubble}
      />
      {runQuery.isError ? (
        <div className={styles.loading}>
          <span>Couldn&apos;t load today&apos;s series.</span>
          <button type="button" onClick={() => void runQuery.refetch()}>
            Retry
          </button>
        </div>
      ) : logos.length === SPEED_ROUND_SIZE && runQuery.data ? (
        <SpeedGame
          key={dayIndex}
          dayIndex={dayIndex}
          logos={logos}
          rightPanel={<SpeedLadder dayIndex={dayIndex} />}
          playBubble={playBubble}
          persistKey={`slogodle:speed:v2:${dayIndex}`}
          remote={toRemote(dayIndex, runQuery.data.state, runQuery.data.clockOffset, () => {
            void queryClient.invalidateQueries({ queryKey: ["speed-ladder", dayIndex] });
            void queryClient.invalidateQueries({ queryKey: ["speed-standing", dayIndex] });
          })}
        />
      ) : (
        <div className={styles.loading}>
          <LoadingCard variant="loading" />
        </div>
      )}
      <GameFooter />
    </div>
  );
}

function toRemote(
  dayIndex: number,
  state: SpeedRunState,
  clockOffset: number,
  onFinished: () => void,
): SpeedRemote {
  const anonId = getAnonId();
  const offsetFor = (serverNow: number) => serverNow - Date.now();
  return {
    startedAt: state.status === "none" ? null : state.startedAt,
    result: state.status === "finished" ? state.result : null,
    clockOffset,
    onStart: async () => {
      const run = await startSpeedRun({ data: { anonId, dayIndex } });
      if (run.status === "none") throw new Error("run not started");
      return { startedAt: run.startedAt, clockOffset: offsetFor(run.serverNow) };
    },
    onFinish: async (guesses) => {
      const run = await finishSpeedRun({ data: { anonId, dayIndex, guesses } });
      if (run.status !== "finished") throw new Error("run not finished");
      onFinished();
      return run.result;
    },
  };
}
