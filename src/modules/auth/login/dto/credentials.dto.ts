import { z } from 'zod';

export const MIN_PASSWORD_LENGTH = 8;

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `At least ${MIN_PASSWORD_LENGTH} characters`)
  .max(128)
  .regex(/[a-z]/i, 'Include a letter')
  .regex(/\d/, 'Include a number');

const emailSchema = z.email().max(254);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterBody = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});
export type LoginBody = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(20).max(200),
});
export type RefreshBody = z.infer<typeof refreshSchema>;
