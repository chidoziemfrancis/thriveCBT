import { z } from 'zod';

import { passwordSchema } from '../../login/dto/credentials.dto.js';
import { codeSchema } from '../../verify-email/dto/verify-email.dto.js';

const emailSchema = z.email().max(254);

export const resetRequestSchema = z.object({ email: emailSchema });
export type ResetRequestBody = z.infer<typeof resetRequestSchema>;

export const resetConfirmSchema = z.object({
  email: emailSchema,
  code: codeSchema,
  password: passwordSchema,
});
export type ResetConfirmBody = z.infer<typeof resetConfirmSchema>;
