import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from '@/lib/storage';

import type { CallRecord } from './callLog';

const STORAGE_KEY = 'researcher_call_log';

type CallLog = Record<string, CallRecord>;

let state: CallLog = readJson<CallLog>(STORAGE_KEY, {});
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useCallLog(): CallLog {
  return useSyncExternalStore(subscribe, () => state);
}

export function logCall(record: CallRecord) {
  state = { ...state, [record.callId]: record };
  writeJson(STORAGE_KEY, state);
  listeners.forEach((listener) => listener());
}
