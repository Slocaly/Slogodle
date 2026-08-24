#!/usr/bin/env node
// Syncs the local @slogodle/logos catalog to the cloud: uploads any missing
// SVGs to R2 and upserts any missing/changed rows into the D1 logo_metadata
// table. Safe to re-run — existing R2 objects are left alone, and D1 rows
// are only written when they don't exist yet or their fields differ.
//
// Usage: pnpm --filter web run sync-logos (loads apps/web/.env)

import { readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { LOGOS, type Logo } from "@slogodle/logos";

const __dirname = dirname(fileURLToPath(import.meta.url));
const logosDir = join(__dirname, "../public/logos");

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
  },
});
const r2Bucket = requireEnv("R2_BUCKET");

const cfAccountId = requireEnv("CF_ACCOUNT_ID");
const cfApiToken = requireEnv("CF_API_TOKEN");
const d1DatabaseId = requireEnv("D1_DATABASE_ID");

interface D1ApiResponse<T> {
  success: boolean;
  errors: { code: number; message: string }[];
  result: { results: T[] }[];
}

async function d1Query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/d1/database/${d1DatabaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfApiToken}`,
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

interface LogoMetadataRow {
  r2_key: string;
  name: string | null;
  industry: string | null;
  founded: number | null;
  description: string | null;
  fun_fact: string | null;
  git_link: string | null;
  aspect: number | null;
}

async function objectExistsInR2(key: string): Promise<boolean> {
  try {
    await r2Client.send(new HeadObjectCommand({ Bucket: r2Bucket, Key: key }));
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      "$metadata" in error &&
      (error as { $metadata?: { httpStatusCode?: number } }).$metadata
        ?.httpStatusCode === 404
    ) {
      return false;
    }
    if (error instanceof Error && error.name === "NotFound") return false;
    throw error;
  }
}

async function uploadToR2(key: string, filePath: string): Promise<void> {
  const body = readFileSync(filePath);
  await r2Client.send(
    new PutObjectCommand({
      Bucket: r2Bucket,
      Key: key,
      Body: body,
      ContentType: "image/svg+xml",
    }),
  );
}

function metadataMatches(existing: LogoMetadataRow, logo: Logo): boolean {
  return (
    existing.name === logo.name &&
    existing.industry === logo.industry &&
    existing.founded === logo.founded &&
    existing.description === logo.description &&
    existing.fun_fact === logo.funFact &&
    existing.git_link === logo.gitLink &&
    existing.aspect === logo.aspect
  );
}

async function upsertMetadata(r2Key: string, logo: Logo): Promise<void> {
  await d1Query(
    `INSERT INTO logo_metadata (r2_key, name, industry, founded, description, fun_fact, git_link, aspect)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(r2_key) DO UPDATE SET
       name = excluded.name,
       industry = excluded.industry,
       founded = excluded.founded,
       description = excluded.description,
       fun_fact = excluded.fun_fact,
       git_link = excluded.git_link,
       aspect = excluded.aspect,
       updated_at = CURRENT_TIMESTAMP`,
    [
      r2Key,
      logo.name,
      logo.industry,
      logo.founded,
      logo.description,
      logo.funFact,
      logo.gitLink,
      logo.aspect,
    ],
  );
}

async function main() {
  console.log(`Syncing ${LOGOS.length} logos…`);

  const existingRows = await d1Query<LogoMetadataRow>(
    "SELECT r2_key, name, industry, founded, description, fun_fact, git_link, aspect FROM logo_metadata",
  );
  const existingByKey = new Map(existingRows.map((row) => [row.r2_key, row]));

  let uploaded = 0;
  let uploadSkipped = 0;
  let inserted = 0;
  let updated = 0;
  let unchanged = 0;

  for (const logo of LOGOS) {
    const r2Key = basename(logo.icon);

    if (await objectExistsInR2(r2Key)) {
      uploadSkipped++;
    } else {
      await uploadToR2(r2Key, join(logosDir, r2Key));
      uploaded++;
      console.log(`  uploaded ${r2Key}`);
    }

    const existing = existingByKey.get(r2Key);
    if (!existing) {
      await upsertMetadata(r2Key, logo);
      inserted++;
      console.log(`  inserted metadata for ${r2Key}`);
    } else if (!metadataMatches(existing, logo)) {
      await upsertMetadata(r2Key, logo);
      updated++;
      console.log(`  updated metadata for ${r2Key}`);
    } else {
      unchanged++;
    }
  }

  console.log("\nDone.");
  console.log(
    `R2: ${uploaded} uploaded, ${uploadSkipped} already present.`,
  );
  console.log(
    `D1: ${inserted} inserted, ${updated} updated, ${unchanged} unchanged.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
