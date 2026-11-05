import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { now } from "../lib/clock";
import { fetchAdminUserCounts, fetchAdminUsers } from "../lib/users";
import styles from "./admin.module.css";

export const Route = createFileRoute("/admin/users")({
  component: UsersSection,
});

function formatDateTime(timestamp: number | null): string {
  if (timestamp === null) return "—";
  return new Date(timestamp).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeLabel(timestamp: number | null): string {
  if (timestamp === null) return "Never";
  const minutes = Math.floor((now().getTime() - timestamp) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return `${days} d ago`;
}

function UsersSection() {
  const [search, setSearch] = useState("");

  const { data, isPending, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchAdminUsers(),
  });

  const { data: counts } = useQuery({
    queryKey: ["admin-user-counts"],
    queryFn: () => fetchAdminUserCounts(),
  });

  const query = search.trim().toLowerCase();
  const filtered = (data ?? []).filter(
    (user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query),
  );

  return (
    <>
      <h1 className={styles.title}>
        Admin — Users{data ? ` (${data.length})` : ""}
      </h1>

      {counts && (
        <p className={styles.empty}>
          {counts.registered} registered · {counts.anonymous} anonymous (
          {counts.registered + counts.anonymous} total)
        </p>
      )}

      <div className={styles.sortRow}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ? (
        <p className={styles.empty}>
          Failed to load users:{" "}
          {error instanceof Error ? error.message : String(error)}
        </p>
      ) : isPending ? (
        <p className={styles.empty}>Loading users…</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>No users match "{search}".</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Last played</th>
                <th>Last seen</th>
                <th>Games</th>
                <th>Signed up</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td title={formatDateTime(user.lastPlayedAt)}>
                    {relativeLabel(user.lastPlayedAt)}
                  </td>
                  <td title={formatDateTime(user.lastSeenAt)}>
                    {relativeLabel(user.lastSeenAt)}
                  </td>
                  <td>{user.gamesPlayed}</td>
                  <td>{formatDateTime(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
