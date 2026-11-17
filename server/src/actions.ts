// Actions for this artifact.
//
// The teaching content is curated at build time and ships in the client
// bundle; these actions only persist the learner's own marks — chapters
// and panorama modules marked as learned ('done') and glossary terms
// starred for review ('fav').

import { defineAction, z, type ActionsModule } from "@hatch/space-sdk";
import { and, eq } from "drizzle-orm";
import * as schema from "./schema";

const markKind = z.enum(["done", "fav"]);

export const Actions = {
  listMarks: defineAction({
    description: "Lists all of the learner's marks (finished items and starred glossary terms).",
    request: z.object({}),
    response: z.object({
      marks: z.array(
        z.object({
          itemId: z.string(),
          kind: markKind,
        }),
      ),
    }),
    async handler(ctx) {
      const db = ctx.db<typeof schema>();
      const rows = await db.select().from(schema.marks);
      return {
        marks: rows.map((row) => ({ itemId: row.itemId, kind: row.kind })),
      };
    },
  }),

  setMark: defineAction({
    description: "Sets or clears one learner mark (finished item or starred term).",
    request: z.object({
      itemId: z.string().min(1).max(120),
      kind: markKind,
      marked: z.boolean(),
    }),
    response: z.object({ ok: z.literal(true) }),
    async handler(ctx, args): Promise<{ ok: true }> {
      const db = ctx.db<typeof schema>();
      if (args.marked) {
        await db
          .insert(schema.marks)
          .values({ itemId: args.itemId, kind: args.kind })
          .onConflictDoNothing();
      } else {
        await db
          .delete(schema.marks)
          .where(
            and(
              eq(schema.marks.itemId, args.itemId),
              eq(schema.marks.kind, args.kind),
            ),
          );
      }
      ctx.invalidateQueries();
      return { ok: true };
    },
  }),
} satisfies ActionsModule;
