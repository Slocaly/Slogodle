#!/usr/bin/env node
// One-time migration: replaces every existing logo_metadata row's r2_key
// (originally the tech's filename, e.g. "react.svg" — visible in the
// network tab and giving away the game's answer) with a random opaque key,
// renaming the matching object in R2 to match. Safe to re-run — it just
// randomizes the keys again — but there's no reason to run it more than
// once.
//
// Usage: pnpm --filter web run rename-logos (loads apps/web/.env)
//        pnpm --filter web run rename-logos -- --dry-run (preview only)

import { randomBytes } from "node:crypto";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${requireEnv("CLOUDFLARE_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
  },
});
const r2Bucket = "logos";

const cfAccountId = requireEnv("CLOUDFLARE_ACCOUNT_ID");
const cfApiToken = requireEnv("CLOUDFLARE_API_TOKEN");
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
  id: number;
  r2_key: string;
  name: string | null;
}

function generateR2Key(): string {
  return `${randomBytes(8).toString("hex")}.svg`;
}

async function renameR2Object(oldKey: string, newKey: string): Promise<void> {
  await r2Client.send(
    new CopyObjectCommand({
      Bucket: r2Bucket,
      CopySource: `${r2Bucket}/${encodeURIComponent(oldKey)}`,
      Key: newKey,
    }),
  );
  await r2Client.send(
    new DeleteObjectCommand({ Bucket: r2Bucket, Key: oldKey }),
  );
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const rows = await d1Query<LogoMetadataRow>(
    "SELECT id, r2_key, name FROM logo_metadata",
  );
  console.log(
    `${dryRun ? "[dry run] " : ""}Renaming ${rows.length} logos…`,
  );

  for (const row of rows) {
    const newKey = generateR2Key();
    if (!dryRun) {
      await renameR2Object(row.r2_key, newKey);
      await d1Query("UPDATE logo_metadata SET r2_key = ? WHERE id = ?", [
        newKey,
        row.id,
      ]);
    }
    console.log(`  ${row.name ?? `#${row.id}`}: ${row.r2_key} → ${newKey}`);
  }

  console.log(dryRun ? "\nDry run complete — nothing changed." : "\nDone.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
