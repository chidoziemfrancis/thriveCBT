import { useEffect } from 'react';

import '@/features/activities';
import '@/features/assessment';
import '@/features/assignment';
import '@/features/beliefs';
import '@/features/consent/consentStore';
import '@/features/coping/store/copingStore';
import '@/features/homework/homeworkStore';
import '@/features/journal';
import '@/features/mood';
import '@/features/onboarding/onboardingStore';
import '@/features/profile/store/emergencyContactStore';
import '@/features/sessions';
import '@/features/thoughts';
import '@/features/wellbeing';
import { startSync } from '@/lib/sync';
import { useSessionStore } from '@/stores/session.store';

/**
 * Keeps a signed-in student's synced data in step with the server: on sign-in, when the app
 * comes back to the front, and whenever a change is waiting. Importing the features registers
 * what they sync, and what to clear when a different student signs in on this phone.
 */
export function useStudentSync() {
  const studentId = useSessionStore((state) =>
    state.status === 'signedIn' && state.user?.role === 'student' ? state.user.id : null
  );
  useEffect(() => (studentId ? startSync() : undefined), [studentId]);
}
