import { z } from 'zod';

import {
  clientUpdatedAt,
  syncListSchema,
  syncMetaSchema,
} from '../../../shared/sync/sync.dto.js';

const sessionId = z.number().int().min(1).max(8);

export const saveHomeworkTickSchema = z.object({
  sessionId,
  date: z.iso.date(),
  updatedAt: clientUpdatedAt,
});
export type SaveHomeworkTick = z.infer<typeof saveHomeworkTickSchema>;

export const homeworkTickSchema = syncMetaSchema.extend({
  sessionId,
  date: z.iso.date(),
});
export type HomeworkTickDto = z.infer<typeof homeworkTickSchema>;

export const homeworkTickListSchema = syncListSchema(homeworkTickSchema);
export type HomeworkTickList = z.infer<typeof homeworkTickListSchema>;
