import { createServerFn } from "@tanstack/react-start";
import {
  listLogoMetadata,
  upsertLogoMetadata,
  type UpsertLogoMetadataInput,
} from "./logo-metadata.server";
import { requireAdmin } from "./session";

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
