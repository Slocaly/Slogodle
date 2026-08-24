-- Migration number: 0001 	 2026-08-22T08:24:48.987Z

CREATE TABLE logo_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  r2_key TEXT NOT NULL UNIQUE,
  name TEXT,
  industry TEXT,
  founded INTEGER,
  description TEXT,
  fun_fact TEXT,
  git_link TEXT,
  aspect REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
