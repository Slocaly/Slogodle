import { env } from "cloudflare:workers";
import { listGameLogosWithId } from "./game-logos.server";
import { pickLogo, type Guess } from "./game-logic";

export interface LogoMistakeStat {
  logoId: number;
  name: string;
  icon: string;
  mistakes: { text: string; count: number }[];
}

interface ProgressMistakeRow {
  logo_id: number | null;
  day_index: number;
  guesses_json: string;
}

const TOP_N = 5;

/**
 * Rows written before the `logo_id` column existed (migration 0005) fall
 * back to the same day_index-derived lookup the game itself always used —
 * exactly as accurate as it's ever been, just not durable against future
 * changes to the logo bank the way `logo_id` is.
 */
export async function topMistakesByLogo(): Promise<LogoMistakeStat[]> {
  const bank = await listGameLogosWithId();
  if (bank.length === 0) return [];
  const byId = new Map(bank.map((logo) => [logo.id, logo]));

  const { results } = await env.DB.prepare(
    `SELECT logo_id, day_index, guesses_json FROM progress WHERE status IN ('won', 'lost')`,
  ).all<ProgressMistakeRow>();

  const countsByLogoId = new Map<number, Map<string, number>>();

  for (const row of results) {
    const logo = row.logo_id != null ? byId.get(row.logo_id) : pickLogo(bank, row.day_index);
    if (!logo) continue;

    let guesses: Guess[];
    try {
      guesses = JSON.parse(row.guesses_json) as Guess[];
    } catch {
      continue;
    }

    const counts = countsByLogoId.get(logo.id) ?? new Map<string, number>();
    for (const guess of guesses) {
      if (guess.correct) continue;
      counts.set(guess.text, (counts.get(guess.text) ?? 0) + 1);
    }
    countsByLogoId.set(logo.id, counts);
  }

  return bank.map((logo) => {
    const counts = countsByLogoId.get(logo.id) ?? new Map<string, number>();
    const mistakes = [...counts.entries()]
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, TOP_N);
    return { logoId: logo.id, name: logo.name, icon: logo.icon, mistakes };
  });
}
