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

interface D1ApiResponse<T> {
  success: boolean;
  errors: { code: number; message: string }[];
  result: { results: T[] }[];
}

async function d1Query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const databaseId = process.env.D1_DATABASE_ID;
  const token = process.env.CF_API_TOKEN;

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    },
  );

  const body = (await res.json()) as D1ApiResponse<T>;
  if (!res.ok || !body.success) {
    const message =
      body.errors?.map((error) => error.message).join(", ") ||
      res.statusText;
    throw new Error(`D1 query failed: ${message}`);
  }

  return body.result[0]?.results ?? [];
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
  const rows = await d1Query<LogoMetadataRow>(
    "SELECT * FROM logo_metadata ORDER BY r2_key",
  );
  return rows.map(toLogoMetadata);
}

export async function upsertLogoMetadata(
  input: UpsertLogoMetadataInput,
): Promise<LogoMetadata> {
  const rows = await d1Query<LogoMetadataRow>(
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
    [
      input.r2Key,
      input.name,
      input.industry,
      input.founded,
      input.description,
      input.funFact,
      input.gitLink,
      input.aspect,
    ],
  );
  return toLogoMetadata(rows[0]);
}
