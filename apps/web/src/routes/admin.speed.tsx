import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SpeedGame } from "../components/SpeedGame";
import { useSoundSettings } from "../hooks/useSoundSettings";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { useGameLogosQuery } from "../hooks/useGameLogosQuery";
import { SPEED_ROUND_SIZE, randomSpeedLogos } from "../lib/speed";

export const Route = createFileRoute("/admin/speed")({
  component: AdminSpeedPage,
});

/**
 * Practice version of the speed game: a fresh random series each time, nothing
 * saved, replayable at will. The public daily series lives at `/speed`.
 */
function AdminSpeedPage() {
  const { soundEnabled } = useSoundSettings();
  const { playBubble, playWrongGuess } = useSoundEffects(soundEnabled);
  const { data: bank } = useGameLogosQuery();
  const [round, setRound] = useState(0);
  // `round` is a deliberate re-roll trigger, not a value used in the callback.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const logos = useMemo(
    () => (bank ? randomSpeedLogos(bank) : []),
    [bank, round],
  );

  if (logos.length !== SPEED_ROUND_SIZE) return <p>Loading logos…</p>;

  return (
    <SpeedGame
      key={round}
      logos={logos}
      playBubble={playBubble}
      playWrongGuess={playWrongGuess}
      soundEnabled={soundEnabled}
      onRestart={() => setRound((r) => r + 1)}
    />
  );
}
