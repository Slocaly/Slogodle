import { env } from "cloudflare:workers";

export interface R2Logo {
  key: string;
  url: string;
}

export async function listR2Logos(): Promise<R2Logo[]> {
  const keys: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await env.LOGO_BUCKET.list({ cursor });
    keys.push(...page.objects.map((object) => object.key));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  return keys.map((key) => ({ key, url: `/api/logos/${key}` }));
}

export async function deleteR2Logo(key: string): Promise<void> {
  await env.LOGO_BUCKET.delete(key);
}
