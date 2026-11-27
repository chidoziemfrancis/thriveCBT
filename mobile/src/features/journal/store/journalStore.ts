import { useSyncExternalStore } from 'react';

import { readJson, removeKey, writeJson } from '@/lib/storage';

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
};

export type JournalDraft = { prompt?: string; text: string; mood?: number };

let entries: JournalEntry[] = readJson<JournalEntry[]>(STORAGE_KEY, []);
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

export function addJournalEntry(entry: Omit<JournalEntry, 'id' | 'at'>, now = new Date()) {
  const created: JournalEntry = { ...entry, id: `entry-${now.getTime()}`, at: now.toISOString() };
  save([...entries, created]);
  return created;
}

export function updateJournalEntry(
  id: string,
  patch: Pick<JournalEntry, 'text' | 'mood'>,
  now = new Date()
) {
  save(entries.map((e) => (e.id === id ? { ...e, ...patch, editedAt: now.toISOString() } : e)));
}

export function deleteJournalEntry(id: string) {
  save(entries.filter((entry) => entry.id !== id));
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
