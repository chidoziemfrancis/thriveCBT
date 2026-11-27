import { z } from 'zod';

import { userSchema } from '../../../users/accounts/dto/user.dto.js';

export const tokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type TokenPair = z.infer<typeof tokenPairSchema>;

export const sessionSchema = tokenPairSchema.extend({ user: userSchema });
export type SessionDto = z.infer<typeof sessionSchema>;
