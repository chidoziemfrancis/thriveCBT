import { z } from 'zod';

import type { User } from '../../../../generated/prisma/client.js';
import type { AuthRole } from '../../../../shared/types/auth-user.js';

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  role: z.enum(['student', 'researcher', 'lead']),
  status: z.enum(['active', 'suspended', 'withdrawn']),
  createdAt: z.iso.datetime(),
});

export type UserDto = z.infer<typeof userSchema>;

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    role: user.role.toLowerCase() as AuthRole,
    status: user.status.toLowerCase() as UserDto['status'],
    createdAt: user.createdAt.toISOString(),
  };
}
