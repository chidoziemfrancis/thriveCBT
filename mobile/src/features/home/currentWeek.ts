import { getAssignment } from '@/features/assignment';
import { getConsent } from '@/features/consent/consentStore';
import { getOnboardingData } from '@/features/onboarding/onboardingStore';

import { weekOfStudy } from './studyWeek';

/**
 * When the student's study started: the server's first consent date, else the phone's consent
 * (offline, before the profile has been pulled), else when they were matched.
 */
export function studyStart(): string | undefined {
  return getOnboardingData().startedAt ?? getConsent()?.agreedAt ?? getAssignment()?.assignedAt;
}

export function currentStudyWeek(now = new Date()): number {
  return weekOfStudy(studyStart(), now);
}
