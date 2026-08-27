-- Migration number: 0004 	 2026-08-27T00:00:00.000Z

CREATE TABLE progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anon_id TEXT,
  user_id TEXT,
  day_index INTEGER NOT NULL,
  status TEXT NOT NULL,
  guess_count INTEGER NOT NULL,
  guesses_json TEXT NOT NULL,
  reward INTEGER NOT NULL,
  created_at INTEGER DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  CHECK ((anon_id IS NULL) <> (user_id IS NULL))
);
CREATE UNIQUE INDEX progress_anon_day_unique ON progress (anon_id, day_index) WHERE anon_id IS NOT NULL;
CREATE UNIQUE INDEX progress_user_day_unique ON progress (user_id, day_index) WHERE user_id IS NOT NULL;
CREATE INDEX progress_user_idx ON progress (user_id);
