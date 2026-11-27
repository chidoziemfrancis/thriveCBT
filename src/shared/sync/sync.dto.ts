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
