import { useMutation } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api-error';

import { profileService } from '../api/profile.service';
import { saveWithdrawalOnPhone } from '../store/withdrawalStore';
import type { ServerWithdrawal, WithdrawBody } from '../types/profile.types';

export function useWithdraw() {
  return useMutation<ServerWithdrawal, ApiError, WithdrawBody>({
    mutationFn: profileService.withdraw,
    onSuccess: ({ at }, { reason }) => saveWithdrawalOnPhone(at, reason),
  });
}
