// Drizzle schema for this space.
//
// The teaching content itself is curated at build time and ships with the
// client bundle (see client/src/content.ts). The only persisted state is
// the learner's own marks: which chapters/modules they have finished
// (kind = 'done') and which glossary terms they have starred
// (kind = 'fav'). One row per (item, kind) pair.

import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const marks = sqliteTable(
  "marks",
  {
    itemId: text("item_id").notNull(),
    kind: text("kind", { enum: ["done", "fav"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [primaryKey({ columns: [table.itemId, table.kind] })],
);
