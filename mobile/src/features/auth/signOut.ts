import { endSession } from '@/lib/session';
import { syncBeforeSignOut } from '@/lib/sync';

import { clearPin } from './store/pinStore';
import { clearUserSession } from './store/userSession';

/** Ends the login on this phone; the next person must sign in with email and password. */
export async function signOut() {
  await syncBeforeSignOut();
  clearUserSession();
  await clearPin();
  await endSession();
}
