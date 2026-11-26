// TEMPORARY. Moves login cookies issued before the shared-cookie deploy
// (host-only on tech.slogodle.com) to .slogodle.com. Old cookies live 7 days at
// most, so delete this file 7 days after that deploy.
// Spec: docs/superpowers/plans/2026-11-26-move-session-cookie.md
import { getCookies } from "better-auth/cookies";
import { BRANDS } from "../brands";
import { buildAuthOptionsFragment } from "./auth-config";

const OLD_HOST = new URL(BRANDS.tech.origin).hostname;
const MARKER = "__Host-slogodle.cookie_moved";
const MARKER_MAX_AGE = 60 * 60 * 24 * 30;
// Without a Domain attribute, a cookie is host-only.
const HOST_ONLY = "Path=/; HttpOnly; Secure; SameSite=Lax";

const { sessionToken } = getCookies(buildAuthOptionsFragment([], false));

export async function withCookieMove(
  request: Request,
  handle: (request: Request) => Promise<Response>,
): Promise<Response> {
  const { name, attributes } = sessionToken;
  const pairs = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((pair) => pair.trim())
    .filter(Boolean);
  const sessions = pairs.filter((pair) => pair.startsWith(`${name}=`));

  if (
    new URL(request.url).hostname !== OLD_HOST ||
    sessions.length === 0 ||
    pairs.some((pair) => pair.startsWith(`${MARKER}=`))
  ) {
    return handle(request);
  }

  // Browsers list same-path cookies oldest first, so the last one is the newest
  // sign-in. better-auth reads the first, so hand it only the newest.
  const newest = sessions.at(-1) as string;
  let forwarded = request;
  if (sessions.length > 1) {
    const headers = new Headers(request.headers);
    const others = pairs.filter((pair) => !pair.startsWith(`${name}=`));
    headers.set("cookie", [...others, newest].join("; "));
    forwarded = new Request(request, { headers });
  }

  const response = await handle(forwarded);
  // A shared cache must never hold a login cookie.
  if (response.headers.get("cache-control")?.includes("public")) {
    return response;
  }

  const headers = new Headers(response.headers);
  const setByApp = headers
    .getSetCookie()
    .some((cookie) => cookie.startsWith(`${name}=`));
  headers.append("set-cookie", `${name}=; Max-Age=0; ${HOST_ONLY}`);
  // With two cookies the domain one already exists. If the app just set or
  // expired the session cookie, its answer wins.
  if (sessions.length === 1 && !setByApp) {
    headers.append(
      "set-cookie",
      `${newest}; Max-Age=${attributes.maxAge}; Domain=${attributes.domain}; ${HOST_ONLY}`,
    );
  }
  headers.append(
    "set-cookie",
    `${MARKER}=1; Max-Age=${MARKER_MAX_AGE}; ${HOST_ONLY}`,
  );
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}
