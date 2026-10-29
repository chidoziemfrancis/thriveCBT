import { readJson, writeJson } from '@/lib/storage';

const STORAGE_KEY = 'journal';

export type JournalEntry = {
  id: string;
  prompt: string;
  text: string;
  sessionId?: number;
  at: string;
};

export function getJournal(): JournalEntry[] {
  return readJson<JournalEntry[]>(STORAGE_KEY, []);
}

export function addJournalEntry(entry: Omit<JournalEntry, 'id' | 'at'>, now = new Date()) {
  const created: JournalEntry = { ...entry, id: `entry-${now.getTime()}`, at: now.toISOString() };
  writeJson(STORAGE_KEY, [...getJournal(), created]);
  return created;
}
