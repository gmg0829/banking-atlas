DROP TABLE entries;
--> statement-breakpoint
CREATE TABLE marks (
  item_id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
