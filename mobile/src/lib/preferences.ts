import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from './storage';

const STORAGE_KEY = 'preferences';

export type MoodReminderTime = '08:00' | '12:00' | '18:00' | '21:00';

export type Preferences = {
  vibration: boolean;
  notifySessions: boolean;
  notifyMood: boolean;
  moodReminderTime: MoodReminderTime;
  notifyMessages: boolean;
  notifyCheckIns: boolean;
};

const DEFAULTS: Preferences = {
  vibration: true,
  notifySessions: true,
  notifyMood: true,
  moodReminderTime: '18:00',
  notifyMessages: true,
  notifyCheckIns: true,
};

let preferences: Preferences = { ...DEFAULTS, ...readJson<Partial<Preferences>>(STORAGE_KEY, {}) };
const listeners = new Set<() => void>();

export function getPreferences(): Preferences {
  return preferences;
}

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  preferences = { ...preferences, [key]: value };
  writeJson(STORAGE_KEY, preferences);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, () => preferences);
}
