const base = (import.meta.env.PUBLIC_GAME_URL ?? "https://tech.slogodle.com").replace(/\/$/, "");

/** Build a link to a page of the game app (apps/web) */
export const gameUrl = (path = "/") => `${base}${path}` || "/";
