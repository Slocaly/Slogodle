import { env } from "cloudflare:workers";
import type { Logo } from "@slogodle/logos";

interface CompleteLogoRow {
  r2_key: string;
  name: string;
  industry: string;
  founded: number;
  description: string;
  fun_fact: string;
  git_link: string;
  aspect: number;
}

function toLogo(row: CompleteLogoRow): Logo {
  return {
    name: row.name,
    industry: row.industry,
    founded: row.founded,
    description: row.description,
    funFact: row.fun_fact,
    icon: `/api/logos/${row.r2_key}`,
    aspect: row.aspect,
    gitLink: row.git_link,
  };
}

/**
 * Every field a `Logo` needs must be non-null for a row to be playable —
 * rows still being filled in via the admin page are silently excluded.
 */
export async function listGameLogos(): Promise<Logo[]> {
  const { results } = await env.DB.prepare(
    `SELECT r2_key, name, industry, founded, description, fun_fact, git_link, aspect
     FROM logo_metadata
     WHERE name IS NOT NULL
       AND industry IS NOT NULL
       AND founded IS NOT NULL
       AND description IS NOT NULL
       AND fun_fact IS NOT NULL
       AND git_link IS NOT NULL
       AND aspect IS NOT NULL
       AND day_order IS NOT NULL
     ORDER BY day_order`,
  ).all<CompleteLogoRow>();
  return results.map(toLogo);
}
