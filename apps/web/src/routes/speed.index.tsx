import { useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/speed/")({
  ssr: false,
  // `?day=N` replays the series of an earlier day (see /speed/history).
  validateSearch: (search: Record<string, unknown>): { day?: number } => {
    const day = Number(search.day);
    return search.day !== undefined && Number.isInteger(day) && day >= 0 ? { day } : {};
  },
  component: SpeedPage,
});

function SpeedPage() {
  useEffect(() => {
    markSpeedSeen();
  }, []);
  const g = useGameState();
  const { playClick, playBubble } = useSoundEffects(g.soundEnabled);
  const { data: bank } = useGameLogosQuery();
  const today = dayIndexFor(now());
  const requestedDay = Route.useSearch().day;
  // Today or a future day can't be replayed: fall back to the ranked run.
  const replay = requestedDay !== undefined && requestedDay < today;
  const dayIndex = replay ? requestedDay : today;
  const queryClient = useQueryClient();
  const runQuery = useQuery({
    queryKey: ["speed-run", dayIndex, replay],
    queryFn: async () => {
      const anonId = getAnonId();
      if (replay) {
        // A past day already played ranked shows that result, not a start button.
        const ranked = await fetchSpeedRun({ data: { anonId, dayIndex } });
        if (ranked.status === "finished") {
          return { state: ranked, clockOffset: ranked.serverNow - Date.now(), viewingRanked: true };
        }
      }
      const state = await fetchSpeedRun({ data: { anonId, dayIndex, replay } });
      return { state, clockOffset: state.serverNow - Date.now(), viewingRanked: false };
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
        historyLinkTo="/speed/history"
      />
      {runQuery.isError ? (
        <div className={styles.loading}>
          <span>Couldn&apos;t load {replay ? "this" : "today's"} series.</span>
          <button type="button" onClick={() => void runQuery.refetch()}>
            Retry
          </button>
        </div>
      ) : logos.length === SPEED_ROUND_SIZE && runQuery.data ? (
        <SpeedGame
          key={`${dayIndex}-${replay}-${runQuery.data.viewingRanked}`}
          // A replay isn't shared: the share text invites people to beat a ranked time.
          dayIndex={replay ? undefined : dayIndex}
          title={replay ? `Series #${dayIndex + 1}` : undefined}
          replay={replay && !runQuery.data.viewingRanked}
          footer={
            <Link to="/speed/history" className={styles.topLink}>
              ← Back to history
            </Link>
          }
          logos={logos}
          rightPanel={<SpeedLadder dayIndex={dayIndex} />}
          playBubble={playBubble}
          persistKey={`slogodle:speed:v2:${replay && !runQuery.data.viewingRanked ? "replay:" : ""}${dayIndex}`}
          remote={toRemote(dayIndex, replay, runQuery.data.state, runQuery.data.clockOffset, () => {
            void queryClient.invalidateQueries({ queryKey: ["speed-ladder", dayIndex] });
            void queryClient.invalidateQueries({ queryKey: ["speed-standing", dayIndex] });
            void queryClient.invalidateQueries({ queryKey: ["speed-history"] });
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
  replay: boolean,
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
      const run = await startSpeedRun({ data: { anonId, dayIndex, replay } });
      if (run.status === "none") throw new Error("run not started");
      return { startedAt: run.startedAt, clockOffset: offsetFor(run.serverNow) };
    },
    onFinish: async (guesses) => {
      const run = await finishSpeedRun({ data: { anonId, dayIndex, replay, guesses } });
      if (run.status !== "finished") throw new Error("run not finished");
      onFinished();
      return run.result;
    },
  };
}
