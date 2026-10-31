import { readJson, writeJson } from '@/lib/storage';

const STORAGE_KEY = 'achievements_seen';

// The highest tier the student has opened for each achievement, so new unlocks can say "New".
type Seen = Record<string, number>;

export function getSeenLevels(): Seen {
  return readJson<Seen>(STORAGE_KEY, {});
}

export function markAchievementSeen(id: string, level: number) {
  const seen = getSeenLevels();
  if ((seen[id] ?? 0) >= level) return;
  writeJson(STORAGE_KEY, { ...seen, [id]: level });
}

export function isNewUnlock(seen: Seen, id: string, level: number) {
  return level > (seen[id] ?? 0);
}
