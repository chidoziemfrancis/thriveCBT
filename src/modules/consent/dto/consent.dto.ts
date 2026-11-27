import { z } from 'zod';

export const giveConsentSchema = z.object({
  version: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9._-]{1,40}$/, 'Unknown consent version'),
});
export type GiveConsentBody = z.infer<typeof giveConsentSchema>;

export const consentSchema = z.object({
  version: z.string(),
  agreedAt: z.iso.datetime(),
});
export type ConsentDto = z.infer<typeof consentSchema>;
