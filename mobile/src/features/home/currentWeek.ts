import { getAssignment } from '@/features/assignment/assignmentStore';
import { getConsent } from '@/features/consent/consentStore';

import { weekOfStudy } from './studyWeek';

/** When the student's study started: when they consented, or else were matched. */
export function studyStart(): string | undefined {
  return getConsent()?.agreedAt ?? getAssignment()?.assignedAt;
}

export function currentStudyWeek(now = new Date()): number {
  return weekOfStudy(studyStart(), now);
}
