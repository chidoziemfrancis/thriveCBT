import { createStore } from '@/lib/createStore';

import type { PositiveEntry, PositiveKind } from './beliefs';

const log = createStore<PositiveEntry[]>('positive_log', []);

export const usePositiveLog = log.use;
export const getPositiveLog = log.get;

/** Newest first. Entries already saved with the same text and kind are skipped. */
export function addPositive(items: { kind: PositiveKind; text: string }[], now = new Date()) {
  const current = log.get();
  const fresh = items
    .map((i) => ({ ...i, text: i.text.trim() }))
    .filter((i) => i.text && !current.some((c) => c.kind === i.kind && c.text === i.text));
  if (fresh.length === 0) return;
  log.set([
    ...fresh.map((i, n) => ({ ...i, id: `positive-${now.getTime()}-${n}`, at: now.toISOString() })),
    ...current,
  ]);
}

export function removePositive(id: string) {
  log.set(log.get().filter((e) => e.id !== id));
}
