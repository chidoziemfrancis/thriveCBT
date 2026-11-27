import * as Crypto from 'expo-crypto';
import { useSyncExternalStore } from 'react';

import { readJson, removeKey, writeJson } from '@/lib/storage';
import {
  mergeServerItems,
  notOnServer,
  queueChange,
  registerSyncKind,
  withUuids,
} from '@/lib/sync';

import { JOURNAL_PATH, journalPath } from '../api/journal.service';
import type { SaveJournalBody, ServerJournalEntry } from '../types/journal.types';

const STORAGE_KEY = 'journal';
const DRAFT_KEY = 'journal_draft';

export type JournalEntry = {
  id: string;
  /** The question the entry answers. Free writing has none. */
  prompt?: string;
  text: string;
  /** How the student felt when writing, on the same 0–4 scale as the mood log. */
  mood?: number;
  sessionId?: number;
  at: string;
  editedAt?: string;
  /** When the phone last changed it; the newest change wins when syncing. */
  updatedAt?: string;
};

export type JournalDraft = { prompt?: string; text: string; mood?: number };

// Entries saved before sync had ids like `entry-1730000000000`; the server needs a UUID, so
// they get one the first time the store loads.
function load(): JournalEntry[] {
  const saved = readJson<JournalEntry[]>(STORAGE_KEY, []);
  const fixed = withUuids(saved, Crypto.randomUUID);
  if (fixed) writeJson(STORAGE_KEY, fixed);
  return fixed ?? saved;
}

let entries: JournalEntry[] = load();
const listeners = new Set<() => void>();

function save(next: JournalEntry[]) {
  entries = next;
  writeJson(STORAGE_KEY, entries);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Live entries, so the Journal and Progress tabs update as soon as one is saved. */
export function useJournal(): JournalEntry[] {
  return useSyncExternalStore(subscribe, () => entries);
}

export function getJournal(): JournalEntry[] {
  return entries;
}

export function getJournalEntry(id: string): JournalEntry | undefined {
  return entries.find((entry) => entry.id === id);
}

function toServer(entry: JournalEntry): SaveJournalBody {
  return {
    prompt: entry.prompt ?? null,
    text: entry.text,
    mood: entry.mood ?? null,
    sessionId: entry.sessionId ?? null,
    at: entry.at,
    editedAt: entry.editedAt ?? null,
    updatedAt: entry.updatedAt ?? new Date().toISOString(),
  };
}

// Saved on the phone first, so it works offline; the sync engine sends it when it can.
function send(entry: JournalEntry) {
  queueChange({
    key: `journal:${entry.id}`,
    kind: 'journal',
    method: 'PUT',
    path: journalPath(entry.id),
    body: toServer(entry),
  });
}

export function addJournalEntry(
  entry: Omit<JournalEntry, 'id' | 'at' | 'updatedAt'>,
  now = new Date()
) {
  const created: JournalEntry = {
    ...entry,
    id: Crypto.randomUUID(),
    at: now.toISOString(),
    updatedAt: new Date().toISOString(),
  };
  save([...entries, created]);
  send(created);
  return created;
}

export function updateJournalEntry(
  id: string,
  patch: Pick<JournalEntry, 'text' | 'mood'>,
  now = new Date()
) {
  const current = getJournalEntry(id);
  if (!current) return;
  const updated: JournalEntry = {
    ...current,
    ...patch,
    editedAt: now.toISOString(),
    updatedAt: new Date().toISOString(),
  };
  save(entries.map((e) => (e.id === id ? updated : e)));
  send(updated);
}

export function deleteJournalEntry(id: string) {
  save(entries.filter((entry) => entry.id !== id));
  queueChange({ key: `journal:${id}`, kind: 'journal', method: 'DELETE', path: journalPath(id) });
}

// A new entry is saved as a draft while typing, so leaving the app or the screen never loses it.
export function getJournalDraft(): JournalDraft | null {
  return readJson<JournalDraft | null>(DRAFT_KEY, null);
}

export function saveJournalDraft(draft: JournalDraft) {
  writeJson(DRAFT_KEY, draft);
}

export function clearJournalDraft() {
  removeKey(DRAFT_KEY);
}

function fromServer(item: ServerJournalEntry): JournalEntry {
  return {
    id: item.id,
    text: item.text,
    at: item.at,
    ...(item.prompt ? { prompt: item.prompt } : {}),
    ...(item.mood !== null ? { mood: item.mood } : {}),
    ...(item.sessionId !== null ? { sessionId: item.sessionId } : {}),
    ...(item.editedAt ? { editedAt: item.editedAt } : {}),
    updatedAt: item.updatedAt,
  };
}

/** Takes the server's entries where they're newer, and removes ones deleted elsewhere. */
export function applyServerJournal(items: ServerJournalEntry[]) {
  save(mergeServerItems(entries, items, fromServer).sort((a, b) => a.at.localeCompare(b.at)));
}

/** Sends entries written before sync existed, unless the server already has them. */
export function uploadLocalJournal(serverItems: ServerJournalEntry[]) {
  notOnServer(entries, serverItems).forEach(send);
}

export function clearLocalJournal() {
  save([]);
  removeKey(DRAFT_KEY);
}

registerSyncKind<ServerJournalEntry>({
  name: 'journal',
  path: JOURNAL_PATH,
  applyServerItems: applyServerJournal,
  uploadLocal: uploadLocalJournal,
  clearLocal: clearLocalJournal,
});
