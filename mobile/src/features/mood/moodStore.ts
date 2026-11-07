import { readJson, writeJson } from '@/lib/storage';

import { MoodEntry, moodOnDay } from './moodLog';

const STORAGE_KEY = 'mood_log';

// Every entry is kept, not just today's, so mood trends can be charted and shared with the
// research team later.
export function getMoodLog(): MoodEntry[] {
  return readJson<MoodEntry[]>(STORAGE_KEY, []);
}

export function logMood(mood: number, now = new Date()): MoodEntry {
  // Changing today's face keeps today's note.
  const note = todaysMood(now)?.note;
  const entry: MoodEntry = { mood, at: now.toISOString(), ...(note ? { note } : {}) };
  writeJson(STORAGE_KEY, [...getMoodLog(), entry]);
  return entry;
}

export function todaysMood(now = new Date()): MoodEntry | null {
  return moodOnDay(getMoodLog(), now);
}

/** Adds, changes or (when blank) removes the note on today's mood. */
export function setTodaysMoodNote(note: string, now = new Date()): MoodEntry | null {
  const log = getMoodLog();
  const today = todaysMood(now);
  if (!today) return null;
  const text = note.trim();
  const updated: MoodEntry = { mood: today.mood, at: today.at, ...(text ? { note: text } : {}) };
  writeJson(
    STORAGE_KEY,
    log.map((entry) => (entry.at === today.at ? updated : entry))
  );
  return updated;
}
