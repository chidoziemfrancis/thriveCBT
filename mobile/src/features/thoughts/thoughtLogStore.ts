import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from '@/lib/storage';

import type { ThoughtRecord } from './thoughtLog';

const STORAGE_KEY = 'thought_log';

let records: ThoughtRecord[] = readJson<ThoughtRecord[]>(STORAGE_KEY, []);
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Newest first. */
export function useThoughtLog(): ThoughtRecord[] {
  return useSyncExternalStore(subscribe, () => records);
}

export function addThoughtRecord(record: Omit<ThoughtRecord, 'id' | 'at'>, now = new Date()) {
  const created: ThoughtRecord = {
    ...record,
    id: `thought-${now.getTime()}`,
    at: now.toISOString(),
  };
  records = [created, ...records];
  writeJson(STORAGE_KEY, records);
  listeners.forEach((listener) => listener());
  return created;
}
