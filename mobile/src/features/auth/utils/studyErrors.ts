import type { Href } from 'expo-router';

import type { ApiError } from '@/lib/api-error';

/**
 * Where an error that means the same on every screen should take the student, and whether to
 * sign them out first; null for every other error, which the screen handles itself.
 */
export function studyErrorRoute(error: ApiError): { route: Href; signOut: boolean } | null {
  switch (error.code) {
    case 'STUDY_WITHDRAWN':
    case 'AUTH_ACCOUNT_WITHDRAWN':
      return { route: '/profile/withdrawn', signOut: true };
    case 'CONSENT_REQUIRED':
      return { route: '/consent/study-info', signOut: false };
    default:
      return null;
  }
}
