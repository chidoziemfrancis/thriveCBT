import { z } from 'zod';

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
    requestId: z.string(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
