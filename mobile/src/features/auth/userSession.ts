import { readJson, removeKey, writeJson } from '@/lib/storage';

const STORAGE_KEY = 'user_session';

type UserSession = { email?: string };

export function getUserSession(): UserSession {
  return readJson<UserSession>(STORAGE_KEY, {});
}

export function setUserSession(patch: Partial<UserSession>) {
  writeJson(STORAGE_KEY, { ...getUserSession(), ...patch });
}

export function clearUserSession() {
  removeKey(STORAGE_KEY);
}
