import { useSyncExternalStore } from 'react';

import { readJson, removeKey, writeJson } from '@/lib/storage';
import { queueChange, registerSyncKind } from '@/lib/sync';

import type { ServerEmergencyContact } from '../types/profile.types';

const CONTACT_KEY = 'emergency_contact';
const DISMISSED_KEY = 'emergency_contact_card_dismissed';
/** When this phone last changed the contact; the newest change wins when syncing. */
const UPDATED_KEY = 'emergency_contact_updated_at';
const PATH = '/me/emergency-contact';

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

// Saved on the phone first, so it works offline; the sync engine sends it when it can.
export function saveEmergencyContact(contact: EmergencyContact) {
  const updatedAt = new Date().toISOString();
  set({ ...state, contact });
  writeJson(UPDATED_KEY, updatedAt);
  queueChange({
    key: 'emergency-contact',
    kind: 'emergency-contact',
    method: 'PUT',
    path: PATH,
    body: { ...contact, updatedAt },
  });
}

export function removeEmergencyContact() {
  set({ ...state, contact: null });
  writeJson(UPDATED_KEY, new Date().toISOString());
  queueChange({
    key: 'emergency-contact',
    kind: 'emergency-contact',
    method: 'DELETE',
    path: PATH,
  });
}

export function dismissEmergencyContactCard() {
  set({ ...state, cardDismissed: true });
}

/** Takes the server's contact (or its removal) when it's at least as new as the phone's. */
export function applyServerEmergencyContact([item]: ServerEmergencyContact[]) {
  if (!item) return;
  const mine = readJson<string | null>(UPDATED_KEY, null);
  if (mine && mine > item.updatedAt) return;
  const { name, relationship, phone } = item;
  set({ ...state, contact: item.deletedAt ? null : { name, relationship, phone } });
  writeJson(UPDATED_KEY, item.updatedAt);
}

/** Sends a contact saved before sync existed, if the server has none. */
export function uploadLocalEmergencyContact(serverItems: ServerEmergencyContact[]) {
  if (serverItems.length === 0 && state.contact) saveEmergencyContact(state.contact);
}

registerSyncKind<ServerEmergencyContact>({
  name: 'emergency-contact',
  path: PATH,
  applyServerItems: applyServerEmergencyContact,
  uploadLocal: uploadLocalEmergencyContact,
  clearLocal: () => {
    set({ contact: null, cardDismissed: false });
    removeKey(UPDATED_KEY);
  },
});
