import { z } from 'zod';

import {
  clientUpdatedAt,
  syncListSchema,
  syncMetaSchema,
} from '../../../shared/sync/sync.dto.js';

export const ACTIVITY_SLOTS = ['morning', 'afternoon', 'evening'] as const;
const slot = z.enum(ACTIVITY_SLOTS);
const score = z.number().int().min(0).max(10);
const sessionId = z.number().int().min(1).max(8);

export const savePlannedActivitySchema = z.object({
  date: z.iso.date(),
  slot,
  label: z.string().trim().min(1).max(120),
  predicted: score.nullable().optional(),
  sessionId: sessionId.nullable().optional(),
  doneAt: z.iso.datetime().nullable().optional(),
  enjoy: score.nullable().optional(),
  achieve: score.nullable().optional(),
  updatedAt: clientUpdatedAt,
});
export type SavePlannedActivity = z.infer<typeof savePlannedActivitySchema>;

export const plannedActivitySchema = syncMetaSchema.extend({
  date: z.iso.date(),
  slot,
  label: z.string(),
  predicted: score.nullable(),
  sessionId: sessionId.nullable(),
  doneAt: z.iso.datetime().nullable(),
  enjoy: score.nullable(),
  achieve: score.nullable(),
});
export type PlannedActivityDto = z.infer<typeof plannedActivitySchema>;

export const plannedActivityListSchema = syncListSchema(plannedActivitySchema);
export type PlannedActivityList = z.infer<typeof plannedActivityListSchema>;
