import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from '@/lib/storage';

const STORAGE_KEY = 'researcher_alerts';

export type AlertEventType = 'acknowledged' | 'note' | 'contactViewed' | 'escalated' | 'handled';

/** One step in how an alert was dealt with. Together they form the record of what was done. */
export type AlertEvent = { type: AlertEventType; at: string; text?: string };

type AlertsState = Record<string, AlertEvent[]>;

let state: AlertsState = readJson<AlertsState>(STORAGE_KEY, {});
const listeners = new Set<() => void>();

function save(next: AlertsState) {
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

export function useAlertEvents(): AlertsState {
  return useSyncExternalStore(subscribe, () => state);
}

export function addAlertEvent(
  alertId: string,
  type: AlertEventType,
  text?: string,
  now = new Date()
) {
  const event: AlertEvent = { type, at: now.toISOString(), text: text?.trim() || undefined };
  save({ ...state, [alertId]: [...(state[alertId] ?? []), event] });
}
