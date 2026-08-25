import { createServerFn } from "@tanstack/react-start";
import {
  listLogoMetadata,
  upsertLogoMetadata,
  reorderLogoMetadata as reorderLogoMetadataDb,
  type UpsertLogoMetadataInput,
} from "./logo-metadata.server";
import { requireAdmin } from "./session.server";

export type {
  LogoMetadata,
  UpsertLogoMetadataInput,
} from "./logo-metadata.server";

export const fetchLogoMetadata = createServerFn({ method: "GET" }).handler(
  () => listLogoMetadata(),
);

export const saveLogoMetadata = createServerFn({ method: "POST" })
  .validator((input: UpsertLogoMetadataInput) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    return upsertLogoMetadata(data);
  });

export const reorderLogoMetadata = createServerFn({ method: "POST" })
  .validator((input: { r2Key: string; dayOrder: number }[]) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    await reorderLogoMetadataDb(data);
  });
