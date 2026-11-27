import { api } from '@/lib/axios';

import type { OnboardingStatus, ServerConsent } from '../types/onboarding.types';

export const onboardingKeys = {
  status: () => ['onboarding', 'status'] as const,
};

export const onboardingService = {
  getStatus: () => api.get<OnboardingStatus>('/me/onboarding').then((r) => r.data),
  getConsent: () => api.get<ServerConsent>('/me/consent').then((r) => r.data),
  giveConsent: (version: string) =>
    api.post<ServerConsent>('/me/consent', { version }).then((r) => r.data),
};
