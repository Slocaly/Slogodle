import { useQuery } from "@tanstack/react-query";
import { getAnonId } from "../lib/anon-id";
import { now } from "../lib/clock";
import { dayIndexFor } from "../lib/game-logic";
import { fetchSpeedStanding } from "../lib/speed-runs";

/** The player's finished Speed run for today (time + ladder rank), if any. */
export function useSpeedStanding(enabled = true) {
  const dayIndex = dayIndexFor(now());
  return useQuery({
    queryKey: ["speed-standing", dayIndex],
    queryFn: () => fetchSpeedStanding({ data: { anonId: getAnonId(), dayIndex } }),
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
