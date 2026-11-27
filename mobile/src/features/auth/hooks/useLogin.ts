import { useMutation } from '@tanstack/react-query';

import { ApiError } from '@/lib/api-error';
import { startSession } from '@/lib/session';

import { authService } from '../api/auth.service';
import type { Credentials, SessionUser } from '../types/auth.types';

export const LEAD_USES_WEB = 'LEAD_USES_WEB';

export function useLogin() {
  return useMutation<SessionUser, ApiError, Credentials>({
    mutationFn: async (credentials) => {
      const session = await authService.login(credentials);
      if (session.user.role === 'lead') {
        throw new ApiError(LEAD_USES_WEB, 'Study lead accounts use the web admin, not the app.');
      }
      await startSession(session);
      return session.user;
    },
  });
}
