import { useMutation } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api-error';
import { useSessionStore } from '@/stores/session.store';

import { authService } from '../api/auth.service';
import type { SessionUser } from '../types/auth.types';

export function useVerifyEmail() {
  return useMutation<SessionUser, ApiError, string>({
    mutationFn: authService.verifyEmail,
    onSuccess: (user) => useSessionStore.getState().setUser(user),
  });
}

export function useResendCode() {
  return useMutation<void, ApiError, void>({ mutationFn: authService.resendCode });
}
