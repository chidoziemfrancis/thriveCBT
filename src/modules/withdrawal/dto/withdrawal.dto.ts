import { z } from 'zod';

export const WITHDRAW_PHRASE = 'WITHDRAW';

export const withdrawSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((reason) => reason || undefined),
  confirm: z.string(),
});
export type WithdrawBody = { reason?: string; confirm: string };

export const withdrawalSchema = z.object({ at: z.iso.datetime() });
export type WithdrawalDto = z.infer<typeof withdrawalSchema>;
