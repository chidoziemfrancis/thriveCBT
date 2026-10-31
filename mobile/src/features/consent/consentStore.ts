import { readJson, writeJson } from '@/lib/storage';

const STORAGE_KEY = 'consent';

export type ConsentRecord = { version: string; agreedAt: string };

export function getConsent(): ConsentRecord | null {
  return readJson<ConsentRecord | null>(STORAGE_KEY, null);
}

export function recordConsent(version: string, now = new Date()) {
  writeJson(STORAGE_KEY, { version, agreedAt: now.toISOString() } satisfies ConsentRecord);
}
