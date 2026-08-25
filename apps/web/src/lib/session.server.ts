import { getRequestHeaders } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { getAuth } from "./auth.server";

/**
 * Throws unless the current request carries a session for the single admin
 * account (`ADMIN_EMAIL`).
 *
 * This guard must stay fail-closed: an unset, empty or whitespace-only
 * `ADMIN_EMAIL` denies everyone, including anonymous visitors. Do not
 * "simplify" it into a bare `session?.user.email === env.ADMIN_EMAIL` — that
 * comparison is `undefined === undefined` for a visitor with no session at all
 * when the variable is unset, which fails *open*.
 *
 * Better Auth lowercases emails server-side on both sign-up and sign-in, so
 * `session.user.email` is always lowercase; both sides are normalised here so a
 * stray capital or trailing space in `ADMIN_EMAIL` can't silently lock the
 * owner out.
 */
export async function requireAdmin(): Promise<void> {
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    throw new Error("Not authorized");
  }
  const session = await getAuth().api.getSession({
    headers: getRequestHeaders(),
  });
  if (session?.user.email?.toLowerCase() !== adminEmail) {
    throw new Error("Not authorized");
  }
}
