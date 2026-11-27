import { z } from 'zod';

import {
  clientUpdatedAt,
  syncListSchema,
  syncMetaSchema,
} from '../../../shared/sync/sync.dto.js';

export const POSITIVE_KINDS = ['strength', 'win', 'kind', 'other'] as const;
const kind = z.enum(POSITIVE_KINDS);

export const savePositiveEntrySchema = z.object({
  kind,
  text: z.string().trim().min(1).max(500),
  at: z.iso.datetime(),
  updatedAt: clientUpdatedAt,
});
export type SavePositiveEntry = z.infer<typeof savePositiveEntrySchema>;

// A deleted entry comes back with empty text.
export const positiveEntrySchema = syncMetaSchema.extend({
  kind,
  text: z.string(),
  at: z.iso.datetime(),
});
export type PositiveEntryDto = z.infer<typeof positiveEntrySchema>;

export const positiveEntryListSchema = syncListSchema(positiveEntrySchema);
export type PositiveEntryList = z.infer<typeof positiveEntryListSchema>;
