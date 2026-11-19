import { env } from "cloudflare:workers";
import { brand } from "../brands";

// Every brand shares one D1 database; game rows (progress, speed_run,
// logo_metadata) carry a `brand` column. Queries on those tables write the
// scope as a `$BRAND` token (`WHERE brand = $BRAND`, `VALUES ($BRAND, …)`) and
// go through prepareScoped, so a statement that forgets the scope fails loudly
// instead of leaking another brand's rows.

export const BRAND_ID: string = brand.id;

const BRAND_TOKEN = "$BRAND";
const BRAND_ID_PATTERN = /^[a-z0-9-]+$/;

export function brandSql(sql: string, brandId: string = BRAND_ID): string {
  if (!BRAND_ID_PATTERN.test(brandId)) {
    throw new Error(`invalid brand id "${brandId}"`);
  }
  if (!sql.includes(BRAND_TOKEN)) {
    throw new Error("game query is missing the $BRAND scope");
  }
  // The id is a validated slug, so inlining it as a SQL literal is safe.
  return sql.replaceAll(BRAND_TOKEN, `'${brandId}'`);
}

export function prepareScoped(sql: string): D1PreparedStatement {
  return env.DB.prepare(brandSql(sql));
}
