import { clearPin } from './pinStore';
import { clearUserSession } from './userSession';

/** Ends the session on this device; the next person must sign in with email and password. */
export async function signOut() {
  clearUserSession();
  await clearPin();
}
