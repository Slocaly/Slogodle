import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { now } from "../lib/clock";
import { useDarkMode } from "../hooks/useDarkMode";
import { useSoundSettings } from "../hooks/useSoundSettings";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { GameHeader } from "../components/GameHeader";
import { DailyFinishChart } from "../components/DailyFinishChart";
import { fetchIsAdmin } from "../lib/session";
import { fetchDailyFinishStats } from "../lib/stats";
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

        <QueryClientProvider client={queryClient}>
          <DailyFinishSection dark={dark} />
        </QueryClientProvider>
      </div>
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
