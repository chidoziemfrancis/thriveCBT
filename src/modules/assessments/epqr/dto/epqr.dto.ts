import { z } from 'zod';

export const EPQR_QUESTION_COUNT = 100;

export const submitEpqrSchema = z.object({
  answers: z.array(z.boolean()).length(EPQR_QUESTION_COUNT),
});
export type SubmitEpqr = z.infer<typeof submitEpqrSchema>;

// Scale scores are for the researcher only; the student never sees personality labels.
export const epqrResultSchema = z.object({
  id: z.uuid(),
  needsSupport: z.boolean(),
  takenAt: z.iso.datetime(),
});
export type EpqrResultDto = z.infer<typeof epqrResultSchema>;
