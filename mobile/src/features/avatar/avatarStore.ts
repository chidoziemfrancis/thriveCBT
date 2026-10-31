import { useSyncExternalStore } from 'react';

import { getUserSession } from '@/features/auth/userSession';
import { readJson, writeJson } from '@/lib/storage';

import { defaultAvatarId } from './avatars';

const STORAGE_KEY = 'avatar_id';

let chosen: string | null = readJson<string | null>(STORAGE_KEY, null);
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function current() {
  return chosen ?? defaultAvatarId(getUserSession().email ?? 'student');
}

/** The student's avatar, live, so Home and Profile change the moment a new one is picked. */
export function useAvatarId(): string {
  return useSyncExternalStore(subscribe, current);
}

export function chooseAvatar(id: string) {
  chosen = id;
  writeJson(STORAGE_KEY, id);
  listeners.forEach((listener) => listener());
}
