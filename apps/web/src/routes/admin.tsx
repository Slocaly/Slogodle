import {
  Link,
  Outlet,
  createFileRoute,
  notFound,
} from "@tanstack/react-router";
import { useDarkMode } from "../hooks/useDarkMode";
import { useSoundSettings } from "../hooks/useSoundSettings";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { GameHeader } from "../components/GameHeader";
import { GameFooter } from "../components/GameFooter";
import { fetchIsAdmin } from "../lib/session";
import styles from "./admin.module.css";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ context }) => {
    const isAdmin = await context.queryClient.ensureQueryData({
      queryKey: ["is-admin"],
      queryFn: () => fetchIsAdmin(),
    });
    if (!isAdmin) {
      throw notFound();
    }
  },
  component: AdminLayout,
  ssr: false,
});

const TABS = [
  { label: "Logos", to: "/admin" },
  { label: "Stats", to: "/admin/stats" },
  { label: "Videos", to: "/admin/videos" },
  { label: "Users", to: "/admin/users" },
  { label: "Speed", to: "/admin/speed" },
] as const;

function AdminLayout() {
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
      />

      <div className={styles.content}>
        <nav className={styles.tabs} aria-label="Admin sections">
          {TABS.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              preload="intent"
              className={styles.tab}
              activeProps={{ className: styles.tabActive }}
              activeOptions={{
                exact: tab.to === "/admin",
                includeSearch: false,
              }}
            >
              {tab.label}
            </Link>
          ))}
          <Link to="/" className={styles.tabsBackLink}>
            ← Back to game
          </Link>
        </nav>

        <Outlet />
      </div>

      <GameFooter />
    </div>
  );
}
