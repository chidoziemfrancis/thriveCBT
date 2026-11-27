import { z } from 'zod';

import { MIN_PASSWORD_LENGTH } from '../password';

export const emailSchema = z.email().max(254);

/** The same rule as the backend: 8 to 128 characters with a letter and a number. */
export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH)
  .max(128)
  .regex(/[a-z]/i)
  .regex(/\d/);

export const codeSchema = z.string().regex(/^\d{6}$/);
