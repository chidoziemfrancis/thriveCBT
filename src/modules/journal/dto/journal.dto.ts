import { z } from 'zod';

import {
  clientUpdatedAt,
  syncListSchema,
  syncMetaSchema,
} from '../../../shared/sync/sync.dto.js';

const mood = z.number().int().min(0).max(4);
const sessionId = z.number().int().min(1).max(8);

export const saveJournalSchema = z.object({
  prompt: z.string().trim().max(300).nullable().optional(),
  text: z.string().max(10_000),
  mood: mood.nullable().optional(),
  sessionId: sessionId.nullable().optional(),
  at: z.iso.datetime(),
  editedAt: z.iso.datetime().nullable().optional(),
  updatedAt: clientUpdatedAt,
});
export type SaveJournal = z.infer<typeof saveJournalSchema>;

// A deleted entry comes back with empty text.
export const journalSchema = syncMetaSchema.extend({
  prompt: z.string().nullable(),
  text: z.string(),
  mood: mood.nullable(),
  sessionId: sessionId.nullable(),
  at: z.iso.datetime(),
  editedAt: z.iso.datetime().nullable(),
});
export type JournalDto = z.infer<typeof journalSchema>;

export const journalListSchema = syncListSchema(journalSchema);
export type JournalList = z.infer<typeof journalListSchema>;
