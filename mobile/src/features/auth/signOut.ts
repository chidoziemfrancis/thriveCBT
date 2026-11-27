import { endSession } from '@/lib/session';

import { clearPin } from './pinStore';
import { clearUserSession } from './userSession';

/** Ends the login on this phone; the next person must sign in with email and password. */
export async function signOut() {
  clearUserSession();
  await clearPin();
  await endSession();
}
