import { useMemo } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GameHeader } from "../components/GameHeader";
import { GameFooter } from "../components/GameFooter";
import { useGameState } from "../hooks/useGameState";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { useGameLogosQuery } from "../hooks/useGameLogosQuery";
import { getAnonId } from "../lib/anon-id";
import { now } from "../lib/clock";
import { dayIndexFor } from "../lib/game-logic";
import { dailySpeedLogos, formatTime } from "../lib/speed";
import { fetchSpeedHistory } from "../lib/speed-runs";
import type { SpeedHistoryEntry } from "../lib/speed-runs";
import shared from "../styles/shared.module.css";
import styles from "./history.module.css";
import speedStyles from "./speed.history.module.css";

export const Route = createFileRoute("/speed/history")({
  component: SpeedHistoryPage,
  ssr: false,
});

interface DayRuns {
  ranked?: SpeedHistoryEntry;
  replay?: SpeedHistoryEntry;
}

function SpeedHistoryPage() {
  const g = useGameState();
  const { playClick, playBubble } = useSoundEffects(g.soundEnabled);
  const { data: bank } = useGameLogosQuery();
  const today = dayIndexFor(now());
  const dayIndices = Array.from({ length: today }, (_, i) => today - 1 - i);

  const historyQuery = useQuery({
    queryFn: () => fetchSpeedHistory({ data: { anonId: getAnonId() } }),
    queryKey: ["speed-history"],
    refetchOnWindowFocus: false,
  });
  const runsByDay = useMemo(() => {
    const map = new Map<number, DayRuns>();
    for (const entry of historyQuery.data ?? []) {
      const day = map.get(entry.dayIndex) ?? {};
      day[entry.isReplay ? "replay" : "ranked"] = entry;
      map.set(entry.dayIndex, day);
    }
    return map;
  }, [historyQuery.data]);

  return (
    <div className={shared.page}>
      <GameHeader
        dark={g.dark}
        onToggleDark={g.toggleDark}
        soundEnabled={g.soundEnabled}
        onToggleSound={g.toggleSound}
        playClick={playClick}
        playBubble={playBubble}
        statsLinkTo="/speed"
      />

      <div className={styles.body}>
        <h1 className={styles.title}>Speed history</h1>

        {!bank || historyQuery.isPending ? (
          <p className={styles.empty}>Loading…</p>
        ) : historyQuery.isError ? (
          <p className={styles.empty}>
            Couldn&apos;t load your history.{" "}
            <button
              type="button"
              className={speedStyles.retry}
              onClick={() => void historyQuery.refetch()}
            >
              Retry
            </button>
          </p>
        ) : dayIndices.length === 0 ? (
          <p className={styles.empty}>
            No earlier series yet. Come back tomorrow!
          </p>
        ) : (
          <div className={styles.grid}>
            {dayIndices.map((idx) => {
              const runs = runsByDay.get(idx);
              // A finished run beats a timed-out one (e.g. a replay after a ranked DNF).
              const shown =
                [runs?.ranked, runs?.replay].find((e) => e && !e.dnf) ??
                runs?.ranked ??
                runs?.replay;
              // The logos stay hidden until the series has been played.
              const logos = shown ? dailySpeedLogos(bank, idx) : null;
              return (
                <Link
                  key={idx}
                  to="/speed"
                  search={{ day: idx }}
                  className={speedStyles.card}
                >
                  <span className={styles.cardDay}>#{idx + 1}</span>
                  <span className={speedStyles.strip}>
                    {logos
                      ? logos.map((l) => (
                          <img
                            key={l.name}
                            className={speedStyles.stripImg}
                            src={l.icon}
                            alt={l.name}
                          />
                        ))
                      : [0, 1, 2, 3, 4].map((i) => (
                          <span
                            key={i}
                            className={`${styles.cardBlur} ${speedStyles.stripBlur}`}
                            data-hue={(idx + i) % 3}
                          />
                        ))}
                  </span>
                  {shown ? (
                    <>
                      <span className={speedStyles.score}>
                        {shown.dnf ? "DNF" : formatTime(shown.scoreMs)}
                      </span>
                      <span className={speedStyles.meta}>
                        {shown.dnf
                          ? `${shown.isReplay ? "Replay · " : ""}Timed out`
                          : shown.rank !== null
                            ? `Rank #${shown.rank}`
                            : "Replay · not ranked"}
                      </span>
                    </>
                  ) : (
                    <span className={speedStyles.play}>Play</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <GameFooter />
    </div>
  );
}
