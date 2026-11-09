import { useQuery } from "@tanstack/react-query";
import { getAnonId } from "../lib/anon-id";
import { formatTime } from "../lib/speed";
import { fetchSpeedLadder } from "../lib/speed-runs";
import styles from "./SpeedLadder.module.css";

export function SpeedLadder({ dayIndex }: { dayIndex: number }) {
  const { data } = useQuery({
    queryFn: () =>
      fetchSpeedLadder({ data: { dayIndex, anonId: getAnonId() } }),
    queryKey: ["speed-ladder", dayIndex],
    refetchOnWindowFocus: false,
  });
  if (data === undefined) return null;

  return (
    <aside className={styles.ladder} aria-label="Daily ladder">
      <h2 className={styles.title}>Daily ladder</h2>
      {data === null ? (
        <p className={styles.empty}>
          Play this series to see how everyone did.
        </p>
      ) : data.length === 0 ? (
        <p className={styles.empty}>Be the first to make a time!</p>
      ) : (
        <ol className={styles.list}>
          {data.map((entry, i) => (
            <li
              key={i}
              className={entry.isMe ? `${styles.row} ${styles.me}` : styles.row}
            >
              <span className={styles.rank}>{i + 1}</span>
              <span className={styles.name}>{entry.name}</span>
              <span className={styles.time}>{formatTime(entry.scoreMs)}</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
