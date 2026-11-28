import { z } from 'zod';

import { clientUpdatedAt } from '../../../../shared/sync/sync.dto.js';

const lines = z.array(z.string().trim().max(300)).max(20);

export const goalSchema = z.object({
  area: z.string().max(100),
  goal: z.string().max(300),
  steps: z.array(z.string().max(200)).max(10),
  date: z.string().max(20),
  done: z.array(z.number().int().min(0).max(9)).max(10).optional(),
});

/** The plan's parts, as Session 8 saves them. */
export const wellPlanContentSchema = z.object({
  triggers: lines.optional(),
  signs: lines.optional(),
  actions: lines.optional(),
  people: lines.optional(),
  note: z.string().max(1000).optional(),
  goal: goalSchema.optional(),
});
export type WellPlanContent = z.infer<typeof wellPlanContentSchema>;

export const saveWellPlanSchema = wellPlanContentSchema.extend({
  updatedAt: clientUpdatedAt,
});
export type SaveWellPlan = z.infer<typeof saveWellPlanSchema>;

export const wellPlanSchema = wellPlanContentSchema.extend({
  updatedAt: z.iso.datetime(),
  deletedAt: z.null(),
});
export type WellPlanDto = z.infer<typeof wellPlanSchema>;

// The same list shape as every synced kind, with at most one item, so the phone syncs it the
// same way.
export const wellPlanListSchema = z.object({
  items: z.array(wellPlanSchema).max(1),
  serverTime: z.iso.datetime(),
});
export type WellPlanList = z.infer<typeof wellPlanListSchema>;
