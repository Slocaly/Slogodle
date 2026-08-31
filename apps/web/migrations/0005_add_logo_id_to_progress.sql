-- Migration number: 0005 	 2026-08-31T00:00:00.000Z

ALTER TABLE progress ADD COLUMN logo_id INTEGER REFERENCES logo_metadata(id);
