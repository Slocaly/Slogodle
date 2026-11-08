-- Migration number: 0007 	 2026-11-08T00:00:00.000Z

-- One speed-round attempt per player per day. Times are measured with the
-- server's clock (started_at at "Start", finished_at when the answers are
-- submitted), so the ladder can't be faked from the browser.
CREATE TABLE speed_run (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anon_id TEXT,
  user_id TEXT,
  day_index INTEGER NOT NULL,
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  duration_ms INTEGER,
  wrong_count INTEGER,
  score_ms INTEGER,
  wrong_counts_json TEXT,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  CHECK ((anon_id IS NULL) <> (user_id IS NULL))
);
CREATE UNIQUE INDEX speed_run_anon_day_unique ON speed_run (anon_id, day_index) WHERE anon_id IS NOT NULL;
CREATE UNIQUE INDEX speed_run_user_day_unique ON speed_run (user_id, day_index) WHERE user_id IS NOT NULL;
CREATE INDEX speed_run_ladder_idx ON speed_run (day_index, score_ms);
