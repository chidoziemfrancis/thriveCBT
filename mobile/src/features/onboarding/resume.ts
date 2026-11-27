import type { Href } from 'expo-router';

import { assessmentService, savePhq9ScoresOnPhone } from '@/features/assessment';
import { assignmentService, saveAssignmentOnPhone } from '@/features/assignment';
import { recordConsent } from '@/features/consent/consentStore';
import { profileService, savePreferencesOnPhone, saveProfileOnPhone } from '@/features/profile';
import { queryClient } from '@/lib/query-client';

import { onboardingKeys, onboardingService } from './api/onboarding.service';
import type { OnboardingStep } from './types/onboarding.types';

const ROUTE_FOR_STEP: Record<OnboardingStep, Href | null> = {
  'verify-email': '/auth/verify-email',
  consent: '/consent/study-info',
  profile: '/onboarding/name',
  eligibility: '/onboarding/eligibility',
  'not-eligible': '/onboarding/not-eligible',
  phq9: '/onboarding/what-to-expect',
  epqr: '/assessment/epqr',
  assignment: '/assignment/finding',
  done: null,
};

/** The screen a student should continue from, or null once the server's steps are done. */
export function routeForStep(step: OnboardingStep): Href | null {
  return ROUTE_FOR_STEP[step];
}

/** Where a student left off, or null if they've finished or the phone is offline. */
export async function resumeRoute(): Promise<Href | null> {
  try {
    const status = await queryClient.fetchQuery({
      queryKey: onboardingKeys.status(),
      queryFn: onboardingService.getStatus,
      staleTime: 0,
    });
    return routeForStep(status.nextStep);
  } catch {
    return null;
  }
}

/**
 * Brings the phone's copies of a student's profile, settings, consent, PHQ-9 scores and
 * researcher up to date. Anything not saved yet on the server is simply skipped.
 */
export async function pullStudentToPhone() {
  const [profile, preferences, consent, phq9, assignment] = await Promise.allSettled([
    profileService.getProfile(),
    profileService.getPreferences(),
    onboardingService.getConsent(),
    assessmentService.listPhq9(),
    assignmentService.get(),
  ]);
  if (profile.status === 'fulfilled') saveProfileOnPhone(profile.value);
  if (preferences.status === 'fulfilled') savePreferencesOnPhone(preferences.value);
  if (consent.status === 'fulfilled') {
    recordConsent(consent.value.version, new Date(consent.value.agreedAt));
  }
  if (phq9.status === 'fulfilled') savePhq9ScoresOnPhone(phq9.value);
  if (assignment.status === 'fulfilled') saveAssignmentOnPhone(assignment.value);
}
