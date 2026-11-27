import { useMutation } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api-error';

import { authService } from '../api/auth.service';
import type { ResetConfirmBody } from '../types/auth.types';

export function useRequestReset() {
  return useMutation<void, ApiError, string>({ mutationFn: authService.requestReset });
}

export function useConfirmReset() {
  return useMutation<void, ApiError, ResetConfirmBody>({ mutationFn: authService.confirmReset });
}
