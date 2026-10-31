import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from '@/lib/storage';

const CONTACT_KEY = 'emergency_contact';
const DISMISSED_KEY = 'emergency_contact_card_dismissed';

export type EmergencyContact = { name: string; relationship: string; phone: string };

type State = { contact: EmergencyContact | null; cardDismissed: boolean };

let state: State = {
  contact: readJson<EmergencyContact | null>(CONTACT_KEY, null),
  cardDismissed: readJson<boolean>(DISMISSED_KEY, false),
};
const listeners = new Set<() => void>();

function set(next: State) {
  state = next;
  writeJson(CONTACT_KEY, state.contact);
  writeJson(DISMISSED_KEY, state.cardDismissed);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useEmergencyContact(): State {
  return useSyncExternalStore(subscribe, () => state);
}

export function getEmergencyContact() {
  return state.contact;
}

export function saveEmergencyContact(contact: EmergencyContact) {
  set({ ...state, contact });
}

export function removeEmergencyContact() {
  set({ ...state, contact: null });
}

export function dismissEmergencyContactCard() {
  set({ ...state, cardDismissed: true });
}
