import { z } from 'zod';

export const PHQ9_QUESTION_COUNT = 9;

export const submitPhq9Schema = z.object({
  kind: z.enum(['baseline', 'final']),
  answers: z.array(z.number().int().min(0).max(3)).length(PHQ9_QUESTION_COUNT),
});
export type SubmitPhq9 = z.infer<typeof submitPhq9Schema>;

export const PHQ9_BANDS = [
  'Minimal',
  'Mild',
  'Moderate',
  'Moderately severe',
  'Severe',
] as const;

export const phq9ResultSchema = z.object({
  id: z.uuid(),
  kind: z.enum(['baseline', 'final']),
  score: z.number().int().min(0).max(27),
  band: z.enum(PHQ9_BANDS),
  needsSupport: z.boolean(),
  takenAt: z.iso.datetime(),
});
export type Phq9ResultDto = z.infer<typeof phq9ResultSchema>;

export const phq9ResultsSchema = z.object({ items: z.array(phq9ResultSchema) });
