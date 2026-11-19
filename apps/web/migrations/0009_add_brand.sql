-- Migration number: 0009 	 2026-11-19T00:00:00.000Z

-- Multi-brand: every brand shares this database, so game rows carry a `brand`
-- column. Existing rows all belong to the original game and backfill to 'tech'
-- through the column default. Auth tables (user, session, account,
-- verification) are shared across brands and stay untouched.
--
-- Known limit: between running this migration and deploying the new code, the
-- old admin logo upsert (`ON CONFLICT(r2_key)`) errors, because r2_key is no
-- longer unique on its own (the constraint is now UNIQUE (brand, r2_key)).
-- Game play keeps working. Deploy right after migrating.

-- progress -------------------------------------------------------------------
ALTER TABLE progress ADD COLUMN brand TEXT NOT NULL DEFAULT 'tech';

DROP INDEX progress_anon_day_unique;
DROP INDEX progress_user_day_unique;
CREATE UNIQUE INDEX progress_anon_day_unique ON progress (anon_id, brand, day_index) WHERE anon_id IS NOT NULL;
CREATE UNIQUE INDEX progress_user_day_unique ON progress (user_id, brand, day_index) WHERE user_id IS NOT NULL;

-- speed_run ------------------------------------------------------------------
ALTER TABLE speed_run ADD COLUMN brand TEXT NOT NULL DEFAULT 'tech';

DROP INDEX speed_run_anon_day_unique;
DROP INDEX speed_run_user_day_unique;
DROP INDEX speed_run_ladder_idx;
CREATE UNIQUE INDEX speed_run_anon_day_unique ON speed_run (anon_id, brand, day_index, is_replay) WHERE anon_id IS NOT NULL;
CREATE UNIQUE INDEX speed_run_user_day_unique ON speed_run (user_id, brand, day_index, is_replay) WHERE user_id IS NOT NULL;
CREATE INDEX speed_run_ladder_idx ON speed_run (brand, day_index, score_ms);

-- logo_metadata --------------------------------------------------------------
-- The inline `r2_key TEXT NOT NULL UNIQUE` can't be altered in SQLite, so the
-- table is rebuilt. Ids are copied as-is: progress.logo_id references
-- logo_metadata(id). Foreign keys are deferred so dropping the old table
-- doesn't fail on those references; they resolve again once the new table
-- takes the logo_metadata name, before the migration's transaction commits.
PRAGMA defer_foreign_keys = on;

CREATE TABLE logo_metadata_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL DEFAULT 'tech',
  r2_key TEXT NOT NULL,
  name TEXT,
  industry TEXT,
  founded INTEGER,
  description TEXT,
  fun_fact TEXT,
  git_link TEXT,
  aspect REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  day_order INTEGER,
  UNIQUE (brand, r2_key)
);

INSERT INTO logo_metadata_new (
  id, brand, r2_key, name, industry, founded, description, fun_fact, git_link,
  aspect, created_at, updated_at, day_order
)
SELECT
  id, 'tech', r2_key, name, industry, founded, description, fun_fact, git_link,
  aspect, created_at, updated_at, day_order
FROM logo_metadata;

DROP TABLE logo_metadata;
ALTER TABLE logo_metadata_new RENAME TO logo_metadata;

CREATE UNIQUE INDEX idx_logo_metadata_day_order ON logo_metadata (brand, day_order);

PRAGMA defer_foreign_keys = off;
