import { z } from 'zod';

import {
  clientUpdatedAt,
  syncListSchema,
  syncMetaSchema,
} from '../../../shared/sync/sync.dto.js';

const text = z.string().max(2000);
const words = z.array(z.string().max(100)).max(20);
const belief = z.number().int().min(0).max(100);
const sessionId = z.number().int().min(1).max(8);

export const saveThoughtRecordSchema = z.object({
  situation: text,
  thought: text,
  feeling: words,
  action: text.nullable().optional(),
  traps: words,
  sessionId: sessionId.nullable().optional(),
  balanced: text.nullable().optional(),
  beliefBefore: belief.nullable().optional(),
  beliefAfter: belief.nullable().optional(),
  at: z.iso.datetime(),
  updatedAt: clientUpdatedAt,
});
export type SaveThoughtRecord = z.infer<typeof saveThoughtRecordSchema>;

// A deleted record comes back with its writing emptied.
export const thoughtRecordSchema = syncMetaSchema.extend({
  situation: z.string(),
  thought: z.string(),
  feeling: z.array(z.string()),
  action: z.string().nullable(),
  traps: z.array(z.string()),
  sessionId: sessionId.nullable(),
  balanced: z.string().nullable(),
  beliefBefore: belief.nullable(),
  beliefAfter: belief.nullable(),
  at: z.iso.datetime(),
});
export type ThoughtRecordDto = z.infer<typeof thoughtRecordSchema>;

export const thoughtRecordListSchema = syncListSchema(thoughtRecordSchema);
export type ThoughtRecordList = z.infer<typeof thoughtRecordListSchema>;
