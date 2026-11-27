import { useMutation } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api-error';

import { authService } from '../api/auth.service';
import type { CheckEmailResult } from '../types/auth.types';

export function useCheckEmail() {
  return useMutation<CheckEmailResult, ApiError, string>({ mutationFn: authService.checkEmail });
}
