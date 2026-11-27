import { router } from 'expo-router';
import { useEffect } from 'react';

import { pullStudentToPhone } from '@/features/onboarding';
import { restoreSession } from '@/lib/session';
import { useSessionStore } from '@/stores/session.store';

import { clearPin } from './pinStore';
import { clearUserSession } from './userSession';

/**
 * Renews the login when the app opens, and sends everyone back to the start when a login
 * ends, whether they logged out or the server ended it.
 */
export function useSessionWatch() {
  useEffect(() => {
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
