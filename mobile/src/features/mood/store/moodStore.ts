import * as Crypto from 'expo-crypto';

import { readJson, writeJson } from '@/lib/storage';
import { queueChange, registerSyncKind } from '@/lib/sync';

import { MOODS_PATH, moodPath } from '../api/mood.service';
import type { SaveMoodBody, ServerMood } from '../types/mood.types';
import { type MoodEntry, moodOnDay } from '../utils/moodLog';

const STORAGE_KEY = 'mood_log';

type StoredMood = MoodEntry & { id: string };

function save(log: StoredMood[]) {
  writeJson(
    STORAGE_KEY,
    [...log].sort((a, b) => a.at.localeCompare(b.at))
  );
}

// Every entry is kept, not just today's, so mood trends can be charted and shared with the
// research team. Entries saved before sync existed get an id the first time they're read.
export function getMoodLog(): StoredMood[] {
  const log = readJson<MoodEntry[]>(STORAGE_KEY, []);
  if (log.every((entry) => entry.id)) return log as StoredMood[];
  const withIds = log.map((entry) => ({ ...entry, id: entry.id ?? Crypto.randomUUID() }));
  save(withIds);
  return withIds;
}

function toServer(entry: StoredMood): SaveMoodBody {
  return {
    mood: entry.mood,
    note: entry.note ?? null,
    at: entry.at,
    updatedAt: entry.updatedAt ?? new Date().toISOString(),
  };
}

function send(entry: StoredMood) {
  queueChange({
    key: `moods:${entry.id}`,
    kind: 'moods',
    method: 'PUT',
    path: moodPath(entry.id),
    body: toServer(entry),
  });
}

export function logMood(mood: number, now = new Date()): StoredMood {
  // Changing today's face keeps today's note.
  const note = todaysMood(now)?.note;
  const entry: StoredMood = {
    id: Crypto.randomUUID(),
    mood,
    at: now.toISOString(),
    ...(note ? { note } : {}),
    updatedAt: new Date().toISOString(),
  };
  save([...getMoodLog(), entry]);
  send(entry);
  return entry;
}

export function todaysMood(now = new Date()): StoredMood | null {
  return moodOnDay(getMoodLog(), now) as StoredMood | null;
}

/** Adds, changes or (when blank) removes the note on today's mood. */
export function setTodaysMoodNote(note: string, now = new Date()): StoredMood | null {
  const today = todaysMood(now);
  if (!today) return null;
  const text = note.trim();
  const updated: StoredMood = {
    id: today.id,
    mood: today.mood,
    at: today.at,
    ...(text ? { note: text } : {}),
    updatedAt: new Date().toISOString(),
  };
  save(getMoodLog().map((entry) => (entry.id === today.id ? updated : entry)));
  send(updated);
  return updated;
}

const isNewer = (a: string, b: string | undefined) => !b || a >= b;

/** Takes the server's moods where they're newer, and removes ones deleted elsewhere. */
export function applyServerMoods(items: ServerMood[]) {
  const byId = new Map(getMoodLog().map((entry) => [entry.id, entry]));
  for (const item of items) {
    const local = byId.get(item.id);
    if (item.deletedAt) {
      byId.delete(item.id);
      continue;
    }
    if (local && !isNewer(item.updatedAt, local.updatedAt)) continue;
    byId.set(item.id, {
      id: item.id,
      mood: item.mood,
      at: item.at,
      ...(item.note ? { note: item.note } : {}),
      updatedAt: item.updatedAt,
    });
  }
  save([...byId.values()]);
}

/** Sends moods saved before sync existed, unless the server already has them. */
export function uploadLocalMoods(serverItems: ServerMood[]) {
  const onServer = new Set(serverItems.map((item) => item.id));
  for (const entry of getMoodLog()) if (!onServer.has(entry.id)) send(entry);
}

export function clearLocalMoods() {
  save([]);
}

registerSyncKind<ServerMood>({
  name: 'moods',
  path: MOODS_PATH,
  applyServerItems: applyServerMoods,
  uploadLocal: uploadLocalMoods,
  clearLocal: clearLocalMoods,
});
