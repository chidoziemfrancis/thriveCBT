import { useEffect } from 'react';

import '@/features/mood';
import '@/features/sessions';
import { startSync } from '@/lib/sync';
import { useSessionStore } from '@/stores/session.store';

/**
 * Keeps a signed-in student's synced data in step with the server: on sign-in, when the app
 * comes back to the front, and whenever a change is waiting. Importing the features registers
 * what they sync.
 */
export function useStudentSync() {
  const studentId = useSessionStore((state) =>
    state.status === 'signedIn' && state.user?.role === 'student' ? state.user.id : null
  );
  useEffect(() => (studentId ? startSync() : undefined), [studentId]);
}
