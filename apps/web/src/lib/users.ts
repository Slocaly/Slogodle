import { createServerFn } from "@tanstack/react-start";
import { getAdminUserCounts, listAdminUsers } from "./users.server";
import { requireAdmin } from "./session.server";

export type { AdminUser, AdminUserCounts } from "./users.server";

export const fetchAdminUsers = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdmin();
    return listAdminUsers();
  },
);

export const fetchAdminUserCounts = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdmin();
    return getAdminUserCounts();
  },
);
