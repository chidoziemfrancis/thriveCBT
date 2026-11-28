import { z } from 'zod';

import {
  clientUpdatedAt,
  syncListSchema,
  syncMetaSchema,
} from '../../../../shared/sync/sync.dto.js';

const level = z.number().int().min(0).max(100);

export const saveStressEntrySchema = z.object({
  situation: z.string().trim().min(1).max(2000),
  level: level.nullable().optional(),
  helped: z.string().trim().max(2000).nullable().optional(),
  at: z.iso.datetime(),
  updatedAt: clientUpdatedAt,
});
export type SaveStressEntry = z.infer<typeof saveStressEntrySchema>;

// A deleted entry comes back with its writing emptied.
export const stressEntrySchema = syncMetaSchema.extend({
  situation: z.string(),
  level: level.nullable(),
  helped: z.string().nullable(),
  at: z.iso.datetime(),
});
export type StressEntryDto = z.infer<typeof stressEntrySchema>;
export const stressEntryListSchema = syncListSchema(stressEntrySchema);
export type StressEntryList = z.infer<typeof stressEntryListSchema>;
