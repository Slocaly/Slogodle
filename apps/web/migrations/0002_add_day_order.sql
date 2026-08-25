-- Migration number: 0002 	 2026-08-25T00:00:00.000Z

ALTER TABLE logo_metadata ADD COLUMN day_order INTEGER;
UPDATE logo_metadata SET day_order = id WHERE day_order IS NULL;
CREATE UNIQUE INDEX idx_logo_metadata_day_order ON logo_metadata(day_order);
