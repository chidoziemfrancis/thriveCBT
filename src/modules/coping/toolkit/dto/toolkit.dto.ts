import { z } from 'zod';

import {
  clientUpdatedAt,
  syncListSchema,
  syncMetaSchema,
} from '../../../../shared/sync/sync.dto.js';

const cardId = z.string().trim().min(1).max(64);

export const saveToolkitItemSchema = z.object({
  cardId,
  updatedAt: clientUpdatedAt,
});
export type SaveToolkitItem = z.infer<typeof saveToolkitItemSchema>;

export const toolkitItemSchema = syncMetaSchema.extend({ cardId: z.string() });
export type ToolkitItemDto = z.infer<typeof toolkitItemSchema>;
export const toolkitListSchema = syncListSchema(toolkitItemSchema);
export type ToolkitList = z.infer<typeof toolkitListSchema>;

// 0 didn't help, 1 helped a bit, 2 helped a lot, as the app asks.
const helped = z.number().int().min(0).max(2);

export const saveToolUseSchema = z.object({
  cardId,
  helped,
  at: z.iso.datetime(),
  updatedAt: clientUpdatedAt,
});
export type SaveToolUse = z.infer<typeof saveToolUseSchema>;

export const toolUseSchema = syncMetaSchema.extend({
  cardId: z.string(),
  helped,
  at: z.iso.datetime(),
});
export type ToolUseDto = z.infer<typeof toolUseSchema>;
export const toolUseListSchema = syncListSchema(toolUseSchema);
export type ToolUseList = z.infer<typeof toolUseListSchema>;
