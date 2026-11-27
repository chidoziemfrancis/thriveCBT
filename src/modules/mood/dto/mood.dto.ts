import { z } from 'zod';

import {
  clientUpdatedAt,
  syncListSchema,
  syncMetaSchema,
} from '../../../shared/sync/sync.dto.js';

// 0 Awful, 1 Low, 2 Okay, 3 Good, 4 Great: the index is the score, as in the app.
const mood = z.number().int().min(0).max(4);

export const saveMoodSchema = z.object({
  mood,
  note: z.string().trim().max(500).nullable().optional(),
  at: z.iso.datetime(),
  updatedAt: clientUpdatedAt,
});
export type SaveMood = z.infer<typeof saveMoodSchema>;

export const moodSchema = syncMetaSchema.extend({
  mood,
  note: z.string().nullable(),
  at: z.iso.datetime(),
});
export type MoodDto = z.infer<typeof moodSchema>;

export const moodListSchema = syncListSchema(moodSchema);
export type MoodList = z.infer<typeof moodListSchema>;
