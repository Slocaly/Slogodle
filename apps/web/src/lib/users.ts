import { createServerFn } from "@tanstack/react-start";
import { listAdminUsers } from "./users.server";
import { requireAdmin } from "./session.server";

export type { AdminUser } from "./users.server";

export const fetchAdminUsers = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return listAdminUsers();
});
