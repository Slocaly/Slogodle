import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { getAuth } from "./auth.server";

export async function requireAdmin(): Promise<void> {
  if (!env.ADMIN_EMAIL) {
    throw new Error("Not authorized");
  }
  const session = await getAuth().api.getSession({
    headers: getRequestHeaders(),
  });
  if (session?.user.email !== env.ADMIN_EMAIL) {
    throw new Error("Not authorized");
  }
}

export const fetchIsAdmin = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      await requireAdmin();
      return true;
    } catch {
      return false;
    }
  },
);
