import { getAssignment } from '@/features/assignment/assignmentStore';
import { getConsent } from '@/features/consent/consentStore';

import { weekOfStudy } from './studyWeek';

/** The student's study week, counted from when they consented (or were matched). */
export function currentStudyWeek(now = new Date()): number {
  return weekOfStudy(getConsent()?.agreedAt ?? getAssignment()?.assignedAt, now);
}
