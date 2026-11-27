import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { recordConsent } from '@/features/consent/consentStore';
import type { ApiError } from '@/lib/api-error';

import { onboardingKeys, onboardingService } from '../api/onboarding.service';
import type { OnboardingStatus, ServerConsent } from '../types/onboarding.types';

export function useOnboarding() {
  return useQuery<OnboardingStatus, ApiError>({
    queryKey: onboardingKeys.status(),
    queryFn: onboardingService.getStatus,
  });
}

export function useGiveConsent() {
  const queryClient = useQueryClient();
  return useMutation<ServerConsent, ApiError, string>({
    mutationFn: onboardingService.giveConsent,
    onSuccess: (consent) => {
      recordConsent(consent.version, new Date(consent.agreedAt));
      void queryClient.invalidateQueries({ queryKey: onboardingKeys.status() });
    },
  });
}
