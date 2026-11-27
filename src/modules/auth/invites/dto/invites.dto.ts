import { z } from 'zod';

import { passwordSchema } from '../../login/dto/credentials.dto.js';

export const createInviteSchema = z.object({
  email: z.email().max(254),
  name: z.string().trim().min(2).max(80),
});
export type CreateInviteBody = z.infer<typeof createInviteSchema>;

export const acceptInviteSchema = z.object({
  token: z.string().min(20).max(200),
  password: passwordSchema,
});
export type AcceptInviteBody = z.infer<typeof acceptInviteSchema>;

export const inviteSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  expiresAt: z.iso.datetime(),
});
export type InviteDto = z.infer<typeof inviteSchema>;
