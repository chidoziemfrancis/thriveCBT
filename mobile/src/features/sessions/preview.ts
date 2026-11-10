import { isTestAccount } from '@/features/auth/mockAccounts';
import { getUserSession } from '@/features/auth/userSession';
import { getPreferences } from '@/lib/preferences';

import { SESSIONS } from './sessions';

// While the app is being tested, every session is open for every account. Set this back to
// false before real students use the app, so sessions open one per study week again.
export const OPEN_ALL_SESSIONS_FOR_TESTING = true;

/** Only test accounts and development builds can open sessions ahead of their week. */
export function canPreviewSessions(): boolean {
  return __DEV__ || isTestAccount(getUserSession().email);
}

/** The last session the student can open: their week, or every session when previewing. */
export function unlockedThrough(week: number): number {
  if (OPEN_ALL_SESSIONS_FOR_TESTING) return SESSIONS.length;
  return canPreviewSessions() && getPreferences().previewSessions ? SESSIONS.length : week;
}
