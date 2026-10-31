import { env } from "cloudflare:workers";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: number;
  /** created_at of the user's most recent progress row, null if they never played. */
  lastPlayedAt: number | null;
  /** Most recent session activity, null if they have no session left. */
  lastSeenAt: number | null;
  gamesPlayed: number;
}

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  created_at: number;
  last_played_at: number | null;
  last_seen_at: number | null;
  games_played: number;
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const { results } = await env.DB.prepare(
    `SELECT
       u.id, u.name, u.email, u.created_at,
       p.last_played_at, p.games_played,
       s.last_seen_at
     FROM user u
     LEFT JOIN (
       SELECT user_id, MAX(created_at) AS last_played_at, COUNT(*) AS games_played
       FROM progress
       WHERE user_id IS NOT NULL
       GROUP BY user_id
     ) p ON p.user_id = u.id
     LEFT JOIN (
       SELECT user_id, MAX(updated_at) AS last_seen_at
       FROM session
       GROUP BY user_id
     ) s ON s.user_id = u.id
     ORDER BY p.last_played_at IS NULL, p.last_played_at DESC, u.created_at DESC`,
  ).all<AdminUserRow>();

  return results.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    lastPlayedAt: row.last_played_at,
    lastSeenAt: row.last_seen_at,
    gamesPlayed: row.games_played ?? 0,
  }));
}
