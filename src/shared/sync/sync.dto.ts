import { z } from 'zod';

// `since` is the server's own time from the last pull, never the phone's clock, so a phone
// with the wrong time still gets every change.
export const sinceQuerySchema = z.object({
  since: z.iso.datetime().optional(),
});
export type SinceQuery = z.infer<typeof sinceQuerySchema>;

/** When the phone made the change; the newest change wins. */
export const clientUpdatedAt = z.iso.datetime();

export function syncListSchema<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item), serverTime: z.iso.datetime() });
}

/** Synced items get their id from the phone, so an item made offline keeps it everywhere. */
export const syncItemParamsSchema = z.object({ id: z.uuid() });

/** What every synced item carries besides its own fields. */
export const syncMetaSchema = z.object({
  id: z.uuid(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
});

export function syncMeta(row: {
  id: string;
  updatedAt: Date;
  deletedAt: Date | null;
}) {
  return {
    id: row.id,
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString() ?? null,
  };
}
