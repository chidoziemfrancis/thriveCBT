import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from '@/lib/storage';

import type { Booking } from './schedule';

const STORAGE_KEY = 'researcher_schedule';

// Bookings live on the researcher's phone until the backend shares them with students.
type ScheduleState = { bookings: Booking[]; cancelled: string[] };

let state: ScheduleState = readJson<ScheduleState>(STORAGE_KEY, { bookings: [], cancelled: [] });
const listeners = new Set<() => void>();

function save(next: ScheduleState) {
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

/** Live bookings and cancellations, so every screen updates the moment a call changes. */
export function useSchedule(): ScheduleState {
  return useSyncExternalStore(subscribe, () => state);
}

export function addBooking(booking: Omit<Booking, 'id'>, now = new Date()): Booking {
  const created = { ...booking, id: `b${now.getTime()}` };
  save({ ...state, bookings: [...state.bookings, created] });
  return created;
}

export function cancelCall(callId: string) {
  if (state.cancelled.includes(callId)) return;
  save({ ...state, cancelled: [...state.cancelled, callId] });
}
