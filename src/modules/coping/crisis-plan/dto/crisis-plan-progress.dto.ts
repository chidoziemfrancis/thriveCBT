import { z } from 'zod';

import { clientUpdatedAt } from '../../../../shared/sync/sync.dto.js';

// The crisis plan has six parts; only how many are filled in leaves the phone.
export const CRISIS_PLAN_PARTS = 6;

export const saveCrisisPlanProgressSchema = z.object({
  partsFilled: z.number().int().min(0).max(CRISIS_PLAN_PARTS),
  updatedAt: clientUpdatedAt,
});
export type SaveCrisisPlanProgress = z.infer<
  typeof saveCrisisPlanProgressSchema
>;

export const crisisPlanProgressSchema = z.object({
  partsFilled: z.number().int().min(0).max(CRISIS_PLAN_PARTS),
  updatedAt: z.iso.datetime(),
});
export type CrisisPlanProgressDto = z.infer<typeof crisisPlanProgressSchema>;
