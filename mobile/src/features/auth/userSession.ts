import { readJson, removeKey, writeJson } from '@/lib/storage';

import type { Role } from './roles';

const STORAGE_KEY = 'user_session';

type UserSession = { email?: string; role?: Role };

export function getUserSession(): UserSession {
  return readJson<UserSession>(STORAGE_KEY, {});
}

export function setUserSession(patch: Partial<UserSession>) {
  writeJson(STORAGE_KEY, { ...getUserSession(), ...patch });
}

export function clearUserSession() {
  removeKey(STORAGE_KEY);
}
