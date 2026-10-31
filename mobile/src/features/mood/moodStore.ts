import { readJson, writeJson } from '@/lib/storage';

import { MoodEntry, moodOnDay } from './moodLog';

const STORAGE_KEY = 'mood_log';

// Every entry is kept, not just today's, so mood trends can be charted and shared with the
// research team later.
export function getMoodLog(): MoodEntry[] {
  return readJson<MoodEntry[]>(STORAGE_KEY, []);
}

export function logMood(mood: number, now = new Date()): MoodEntry {
  const entry = { mood, at: now.toISOString() };
  writeJson(STORAGE_KEY, [...getMoodLog(), entry]);
  return entry;
}

export function todaysMood(now = new Date()): MoodEntry | null {
  return moodOnDay(getMoodLog(), now);
}
