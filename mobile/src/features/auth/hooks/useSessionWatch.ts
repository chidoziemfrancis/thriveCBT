import { router } from 'expo-router';
import { useEffect } from 'react';

import { pullStudentToPhone } from '@/features/onboarding';
import { onApiError } from '@/lib/query-client';
import { restoreSession } from '@/lib/session';
import { useSessionStore } from '@/stores/session.store';

import { clearPin } from '../store/pinStore';
import { signOut } from '../signOut';
import { clearUserSession } from '../store/userSession';
import { studyErrorRoute } from '../utils/studyErrors';

/**
 * Renews the login when the app opens, and sends everyone back to the start when a login
 * ends, whether they logged out or the server ended it. Errors that mean the same on every
 * screen (left the study, consent missing) go to their screen from wherever they happen.
 */
export function useSessionWatch() {
  useEffect(() => {
    onApiError(async (error) => {
      const next = studyErrorRoute(error);
      if (!next) return;
      if (next.signOut) await signOut();
      if (router.canDismiss()) router.dismissAll();
      router.replace(next.route);
    });
    void restoreSession().then(() => {
      if (useSessionStore.getState().user?.role === 'student') void pullStudentToPhone();
    });
    return useSessionStore.subscribe((state, previous) => {
      if (state.status !== 'signedOut' || previous.user === null) return;
      clearUserSession();
      void clearPin();
      if (router.canDismiss()) router.dismissAll();
      router.replace('/');
    });
  }, []);
}
