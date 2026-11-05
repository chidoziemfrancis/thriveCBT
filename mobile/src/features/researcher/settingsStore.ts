import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from '@/lib/storage';

import { DEFAULT_HOURS, type DayHours, type WeeklyHours } from './schedule';

const STORAGE_KEY = 'researcher_settings';

/** Unset fields fall back to the researcher's profile. */
export type ResearcherSettings = {
  name?: string;
  bio?: string;
  capacity?: number;
  accepting?: boolean;
  hours: WeeklyHours;
  notify: { messages: boolean; calls: boolean };
};

const DEFAULTS: ResearcherSettings = {
  hours: DEFAULT_HOURS,
  notify: { messages: true, calls: true },
};

let state: ResearcherSettings = {
  ...DEFAULTS,
  ...readJson<Partial<ResearcherSettings>>(STORAGE_KEY, {}),
};
const listeners = new Set<() => void>();

function save(next: ResearcherSettings) {
  state = next;
  writeJson(STORAGE_KEY, state);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useResearcherSettings(): ResearcherSettings {
  return useSyncExternalStore(subscribe, () => state);
}

export function updateSettings(patch: Partial<Omit<ResearcherSettings, 'hours' | 'notify'>>) {
  save({ ...state, ...patch });
}

export function setDayHours(day: number, hours: Partial<DayHours>) {
  save({ ...state, hours: { ...state.hours, [day]: { ...state.hours[day], ...hours } } });
}

export function setNotify(key: keyof ResearcherSettings['notify'], on: boolean) {
  save({ ...state, notify: { ...state.notify, [key]: on } });
}
