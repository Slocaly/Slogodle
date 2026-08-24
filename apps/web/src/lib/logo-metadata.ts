import { createServerFn } from "@tanstack/react-start";
import {
  listLogoMetadata,
  upsertLogoMetadata,
  type UpsertLogoMetadataInput,
} from "./logo-metadata.server";

export type {
  LogoMetadata,
  UpsertLogoMetadataInput,
} from "./logo-metadata.server";

export const fetchLogoMetadata = createServerFn({ method: "GET" }).handler(
  () => listLogoMetadata(),
);

export const saveLogoMetadata = createServerFn({ method: "POST" })
  .validator((input: UpsertLogoMetadataInput) => input)
  .handler(({ data }) => upsertLogoMetadata(data));
