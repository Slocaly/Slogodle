-- Migration number: 0008 	 2026-11-09T00:00:00.000Z

-- Replays of past series live in the same table as ranked runs, flagged with
-- is_replay = 1. The ladder only ever reads is_replay = 0, so a replay is
-- stored (and shown in the player's history) but never ranked. A player gets
-- one ranked run and one replay per day.
ALTER TABLE speed_run ADD COLUMN is_replay INTEGER NOT NULL DEFAULT 0;

DROP INDEX speed_run_anon_day_unique;
DROP INDEX speed_run_user_day_unique;
CREATE UNIQUE INDEX speed_run_anon_day_unique ON speed_run (anon_id, day_index, is_replay) WHERE anon_id IS NOT NULL;
CREATE UNIQUE INDEX speed_run_user_day_unique ON speed_run (user_id, day_index, is_replay) WHERE user_id IS NOT NULL;
