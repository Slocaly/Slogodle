import { useQuery } from "@tanstack/react-query";
import { fetchGameLogos } from "../lib/game-logos";

// The logo bank rarely changes, so keep it fresh for a while to avoid
// refetching every time this hook remounts across routes (game/history/stats).
const GAME_LOGOS_STALE_TIME = 5 * 60 * 1000;

export function useGameLogosQuery() {
  return useQuery({
    queryFn: () => fetchGameLogos(),
    queryKey: ["game-logos"],
    staleTime: GAME_LOGOS_STALE_TIME,
  });
}
