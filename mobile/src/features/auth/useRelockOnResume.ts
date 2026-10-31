import { router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { shouldRelock } from './pin';
import { hasPin } from './pinStore';
import { getUserSession } from './userSession';

/** Asks for the PIN again when a signed-in user returns after being away a while. */
export function useRelockOnResume() {
  const pathname = usePathname();
  const currentPath = useRef(pathname);

  useEffect(() => {
    currentPath.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let backgroundedAt: number | null = null;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        backgroundedAt = Date.now();
        return;
      }
      if (state !== 'active') return;

      const away = shouldRelock(backgroundedAt, Date.now());
      backgroundedAt = null;
      const path = currentPath.current;
      // Not while signing in or on the welcome screen, which handle the PIN themselves.
      const onAuthScreen = path === '/' || path.startsWith('/auth');
      if (away && !onAuthScreen && hasPin() && getUserSession().email) {
        router.push({ pathname: '/auth/unlock', params: { mode: 'resume' } });
      }
    });

    return () => subscription.remove();
  }, []);
}
