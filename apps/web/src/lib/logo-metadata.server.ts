import { env } from "cloudflare:workers";

export interface LogoMetadata {
  id: number;
  r2Key: string;
  name: string | null;
  industry: string | null;
  founded: number | null;
  description: string | null;
  funFact: string | null;
  gitLink: string | null;
  aspect: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertLogoMetadataInput {
  r2Key: string;
  name: string | null;
  industry: string | null;
  founded: number | null;
  description: string | null;
  funFact: string | null;
  gitLink: string | null;
  aspect: number | null;
}

interface LogoMetadataRow {
  id: number;
  r2_key: string;
  name: string | null;
  industry: string | null;
  founded: number | null;
  description: string | null;
  fun_fact: string | null;
  git_link: string | null;
  aspect: number | null;
  created_at: string;
  updated_at: string;
}

function toLogoMetadata(row: LogoMetadataRow): LogoMetadata {
  return {
    id: row.id,
    r2Key: row.r2_key,
    name: row.name,
    industry: row.industry,
    founded: row.founded,
    description: row.description,
    funFact: row.fun_fact,
    gitLink: row.git_link,
    aspect: row.aspect,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listLogoMetadata(): Promise<LogoMetadata[]> {
  const { results } = await env.DB.prepare(
    "SELECT * FROM logo_metadata ORDER BY r2_key",
  ).all<LogoMetadataRow>();
  return results.map(toLogoMetadata);
}

export async function upsertLogoMetadata(
  input: UpsertLogoMetadataInput,
): Promise<LogoMetadata> {
  const row = await env.DB.prepare(
    `INSERT INTO logo_metadata (r2_key, name, industry, founded, description, fun_fact, git_link, aspect, day_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(day_order), 0) + 1 FROM logo_metadata))
     ON CONFLICT(r2_key) DO UPDATE SET
       name = excluded.name,
       industry = excluded.industry,
       founded = excluded.founded,
       description = excluded.description,
       fun_fact = excluded.fun_fact,
       git_link = excluded.git_link,
       aspect = excluded.aspect,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
  )
    .bind(
      input.r2Key,
      input.name,
      input.industry,
      input.founded,
      input.description,
      input.funFact,
      input.gitLink,
      input.aspect,
    )
    .first<LogoMetadataRow>();

  if (!row) throw new Error("Upsert of logo metadata returned no row");
  return toLogoMetadata(row);
}
