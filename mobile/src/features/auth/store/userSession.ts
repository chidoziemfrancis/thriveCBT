import { readJson, removeKey, writeJson } from '@/lib/storage';

const STORAGE_KEY = 'user_session';

// Only the join-link code is kept here now; who is logged in lives in the session store.
// B3 sends the code to the backend's assignment endpoint.
type UserSession = { inviteCode?: string };

export function getUserSession(): UserSession {
  return readJson<UserSession>(STORAGE_KEY, {});
}

export function setUserSession(patch: Partial<UserSession>) {
  writeJson(STORAGE_KEY, { ...getUserSession(), ...patch });
}

export function clearUserSession() {
  removeKey(STORAGE_KEY);
}
