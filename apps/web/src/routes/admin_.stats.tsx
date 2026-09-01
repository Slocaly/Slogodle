import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";
import { now } from "../lib/clock";
import { useDarkMode } from "../hooks/useDarkMode";
import { useSoundSettings } from "../hooks/useSoundSettings";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { GameHeader } from "../components/GameHeader";
import { GameFooter } from "../components/GameFooter";
import { DailyFinishChart } from "../components/DailyFinishChart";
import { fetchIsAdmin } from "../lib/session";
import { fetchDailyFinishStats } from "../lib/stats";
import { fetchTopMistakes } from "../lib/mistakes";
import styles from "./admin.module.css";

const queryClient = new QueryClient();

function monthKeyFor(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseMonthKey(key: string): { year: number; month: number } {
  const [year, month] = key.split("-").map(Number);
  return { year, month: month - 1 };
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

const viewModeParser = parseAsStringLiteral(["finishes", "mistakes"] as const).withDefault(
  "finishes",
);

export const Route = createFileRoute("/admin_/stats")({
  ssr: false,
  beforeLoad: async () => {
    const isAdmin = await fetchIsAdmin();
    if (!isAdmin) {
      throw notFound();
    }
  },
  component: AdminStatsPage,
});

function AdminStatsPage() {
  const { dark, toggleDark } = useDarkMode();
  const { soundEnabled, toggleSound } = useSoundSettings();
  const { playClick, playBubble } = useSoundEffects(soundEnabled);
  const [viewMode, setViewMode] = useQueryState("view", viewModeParser);

  return (
    <div className={styles.page}>
      <GameHeader
        dark={dark}
        onToggleDark={toggleDark}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        playClick={playClick}
        playBubble={playBubble}
        statsLinkTo="/admin"
      />

      <div className={styles.content}>
        <Link to="/" className={styles.backLink}>
          ← Back to game
        </Link>

        <h1 className={styles.title}>Admin — Stats</h1>

        <div className={styles.sortRow}>
          <span className={styles.sortLabel}>View</span>
          <button
            type="button"
            className={`${styles.sortBtn} ${viewMode === "finishes" ? styles.sortBtnActive : ""}`}
            onClick={() => setViewMode("finishes")}
          >
            Daily finishes
          </button>
          <button
            type="button"
            className={`${styles.sortBtn} ${viewMode === "mistakes" ? styles.sortBtnActive : ""}`}
            onClick={() => setViewMode("mistakes")}
          >
            Common mistakes
          </button>
        </div>

        <QueryClientProvider client={queryClient}>
          {viewMode === "finishes" ? (
            <DailyFinishSection dark={dark} />
          ) : (
            <MistakesSection />
          )}
        </QueryClientProvider>
      </div>

      <GameFooter />
    </div>
  );
}

function DailyFinishSection({ dark }: { dark: boolean }) {
  const currentMonthKey = monthKeyFor(now());
  const [monthKey, setMonthKey] = useQueryState(
    "month",
    parseAsString.withDefault(currentMonthKey),
  );
  const { year, month } = parseMonthKey(monthKey);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin-stats", "daily-finish", year, month],
    queryFn: () => fetchDailyFinishStats({ data: { year, month } }),
  });

  const shiftMonth = (delta: number) => {
    setMonthKey(monthKeyFor(new Date(year, month + delta, 1)));
  };

  return (
    <div className={styles.statsCard}>
      <div className={styles.statsCardHeader}>
        <h2 className={styles.statsCardTitle}>Daily finishes by tries</h2>
        <div className={styles.monthSelector}>
          <button
            type="button"
            className={styles.monthBtn}
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
          >
            ‹
          </button>
          <span className={styles.monthLabel}>{monthLabel(year, month)}</span>
          <button
            type="button"
            className={styles.monthBtn}
            onClick={() => shiftMonth(1)}
            disabled={monthKey >= currentMonthKey}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>
      {error ? (
        <p className={styles.empty}>
          Failed to load stats:{" "}
          {error instanceof Error ? error.message : String(error)}
        </p>
      ) : isPending ? (
        <p className={styles.empty}>Loading stats…</p>
      ) : (
        <DailyFinishChart stats={data} dark={dark} />
      )}
    </div>
  );
}

function MistakesSection() {
  const [search, setSearch] = useState("");

  const { data, isPending, error } = useQuery({
    queryKey: ["admin-stats", "mistakes"],
    queryFn: () => fetchTopMistakes(),
  });

  const query = search.trim().toLowerCase();
  const filtered = (data ?? []).filter((logo) =>
    logo.name.toLowerCase().includes(query),
  );

  return (
    <div className={styles.statsCard}>
      <div className={styles.statsCardHeader}>
        <h2 className={styles.statsCardTitle}>Common mistakes by logo</h2>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by logo name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {error ? (
        <p className={styles.empty}>
          Failed to load mistakes:{" "}
          {error instanceof Error ? error.message : String(error)}
        </p>
      ) : isPending ? (
        <p className={styles.empty}>Loading mistakes…</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>No logos match "{search}".</p>
      ) : (
        <div className={styles.mistakesList}>
          {filtered.map((logo) => (
            <div key={logo.logoId} className={styles.mistakeCard}>
              <div className={styles.mistakeCardHeader}>
                <img src={logo.icon} alt="" width={56} height={56} />
                <span className={styles.mistakeName}>{logo.name}</span>
              </div>
              <div className={styles.mistakeGuesses}>
                {logo.mistakes.length === 0 ? (
                  <span className={styles.r2ReadEmpty}>
                    No wrong guesses yet
                  </span>
                ) : (
                  logo.mistakes.map((mistake) => (
                    <div key={mistake.text} className={styles.mistakeRow}>
                      <span className={styles.mistakeText}>
                        {mistake.text}
                      </span>
                      <span className={styles.mistakeCount}>
                        {mistake.count}×
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
