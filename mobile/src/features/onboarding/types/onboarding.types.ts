import type { ResponseOf } from '@/types/api-helpers';

export type OnboardingStatus = ResponseOf<'/v1/me/onboarding', 'get'>;
export type OnboardingStep = OnboardingStatus['nextStep'];
export type ServerConsent = ResponseOf<'/v1/me/consent', 'get'>;
