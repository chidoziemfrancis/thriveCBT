import { useMutation } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api-error';
import { startSession } from '@/lib/session';

import { authService } from '../api/auth.service';
import type { Credentials, SessionUser } from '../types/auth.types';

export function useRegister() {
  return useMutation<SessionUser, ApiError, Credentials>({
    mutationFn: async (credentials) => {
      const session = await authService.register(credentials);
      await startSession(session);
      return session.user;
    },
  });
}
