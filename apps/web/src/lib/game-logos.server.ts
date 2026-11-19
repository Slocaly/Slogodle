import type { Logo } from "@slogodle/logos";
import { brand } from "../brands";
import { prepareScoped } from "./brand-db.server";

interface CompleteLogoRow {
  id: number;
  r2_key: string;
  name: string;
  industry: string;
  founded: number;
  description: string;
  fun_fact: string;
  git_link: string | null;
  aspect: number;
}

function toLogo(row: CompleteLogoRow): Logo {
  return {
    aspect: row.aspect,
    description: row.description,
    founded: row.founded,
    funFact: row.fun_fact,
    gitLink: row.git_link,
    icon: `/api/logos/${row.r2_key}`,
    industry: row.industry,
    name: row.name,
  };
}

/**
 * Every field a `Logo` needs must be non-null for a row to be playable —
 * rows still being filled in via the admin page are silently excluded. The
 * git link is only part of that set for brands whose logos are open-source
 * projects (`brand.requiresGitLink`).
 */
export function buildCompleteLogosSql(requiresGitLink: boolean): string {
  return `SELECT id, r2_key, name, industry, founded, description, fun_fact, git_link, aspect
     FROM logo_metadata
     WHERE brand = $BRAND
       AND name IS NOT NULL
       AND industry IS NOT NULL
       AND founded IS NOT NULL
       AND description IS NOT NULL
       AND fun_fact IS NOT NULL${requiresGitLink ? "\n       AND git_link IS NOT NULL" : ""}
       AND aspect IS NOT NULL
       AND day_order IS NOT NULL
     ORDER BY day_order`;
}

async function fetchCompleteLogoRows(): Promise<CompleteLogoRow[]> {
  const { results } = await prepareScoped(
    buildCompleteLogosSql(brand.requiresGitLink),
  ).all<CompleteLogoRow>();
  return results;
}

export async function listGameLogos(): Promise<Logo[]> {
  const rows = await fetchCompleteLogoRows();
  return rows.map(toLogo);
}

/**
 * Same bank as `listGameLogos`, but keeps each logo's `logo_metadata.id` —
 * needed server-side to record which logo a guess was actually for (see
 * `progress.server.ts`'s `syncDay`), without leaking the internal id to the
 * client-facing `Logo` type.
 */
export async function listGameLogosWithId(): Promise<
  (Logo & { id: number })[]
> {
  const rows = await fetchCompleteLogoRows();
  return rows.map((row) => ({ ...toLogo(row), id: row.id }));
}
