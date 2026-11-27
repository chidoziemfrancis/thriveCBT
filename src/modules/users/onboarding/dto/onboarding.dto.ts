import { z } from 'zod';

export const ONBOARDING_STEPS = [
  'verify-email',
  'consent',
  'profile',
  'eligibility',
  'not-eligible',
  'phq9',
  'epqr',
  'assignment',
  'done',
] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const onboardingSchema = z.object({
  nextStep: z.enum(ONBOARDING_STEPS),
  emailVerified: z.boolean(),
  consented: z.boolean(),
  profileComplete: z.boolean(),
  isUndergraduate: z.boolean().nullable(),
  phq9Done: z.boolean(),
  epqrDone: z.boolean(),
  matched: z.boolean(),
});
export type OnboardingDto = z.infer<typeof onboardingSchema>;
