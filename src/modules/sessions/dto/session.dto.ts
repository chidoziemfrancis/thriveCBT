import { z } from 'zod';

import {
  clientUpdatedAt,
  syncListSchema,
} from '../../../shared/sync/sync.dto.js';

export const SESSION_COUNT = 8;

const stepId = z.string().min(1).max(64);
const text = z.string().max(5000);

// Exactly the shapes the app saves today: a choice, several choices, a list, yes/no, or text.
export const stepAnswerSchema = z.union([
  z.number(),
  z.array(z.number()).max(50),
  z.array(text).max(50),
  z.boolean(),
  text,
]);

export const saveSessionSchema = z.object({
  done: z.array(stepId).max(20),
  answers: z
    .record(stepId, stepAnswerSchema)
    .refine(
      (answers) => Object.keys(answers).length <= 200,
      'Too many answers',
    ),
  completedAt: z.iso.datetime().nullable().optional(),
  updatedAt: clientUpdatedAt,
});
export type SaveSession = z.infer<typeof saveSessionSchema>;

export const sessionSchema = z.object({
  sessionId: z.number().int().min(1).max(SESSION_COUNT),
  done: z.array(z.string()),
  answers: z.record(z.string(), stepAnswerSchema),
  completedAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime(),
});
export type SessionDto = z.infer<typeof sessionSchema>;

export const sessionListSchema = syncListSchema(sessionSchema);
export type SessionList = z.infer<typeof sessionListSchema>;

export const sessionIdSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(SESSION_COUNT);
