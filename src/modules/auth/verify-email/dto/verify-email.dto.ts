import { z } from 'zod';

export const codeSchema = z.string().regex(/^\d{6}$/, 'Enter the 6-digit code');

export const verifyEmailSchema = z.object({ code: codeSchema });
export type VerifyEmailBody = z.infer<typeof verifyEmailSchema>;
