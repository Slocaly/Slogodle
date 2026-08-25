import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { getAuth } from "./auth.server";

export const fetchIsAdmin = createServerFn({ method: "GET" }).handler(
  async () => {
    if (!env.ADMIN_EMAIL) return false;
    const session = await getAuth().api.getSession({
      headers: getRequestHeaders(),
    });
    return session?.user.email === env.ADMIN_EMAIL;
  },
);
