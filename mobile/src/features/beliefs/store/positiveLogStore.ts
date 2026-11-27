import * as Crypto from 'expo-crypto';

import { createStore } from '@/lib/createStore';
import {
  mergeServerItems,
  notOnServer,
  queueChange,
  registerSyncKind,
  withUuids,
} from '@/lib/sync';

import { POSITIVE_ENTRIES_PATH, positiveEntryPath } from '../api/positiveLog.service';
import type { ServerPositiveEntry } from '../types/positiveLog.types';
import type { PositiveEntry, PositiveKind } from '../utils/beliefs';

const log = createStore<PositiveEntry[]>('positive_log', []);

// Entries saved before sync had ids like `positive-1730000000000-0`; they get a UUID once.
const fixed = withUuids(log.get(), Crypto.randomUUID);
if (fixed) log.set(fixed);

export const usePositiveLog = log.use;
export const getPositiveLog = log.get;

function setNewestFirst(entries: PositiveEntry[]) {
  log.set([...entries].sort((a, b) => b.at.localeCompare(a.at)));
}

// Saved on the phone first, so it works offline; the sync engine sends it when it can.
function send(entry: PositiveEntry) {
  queueChange({
    key: `positive-entries:${entry.id}`,
    kind: 'positive-entries',
    method: 'PUT',
    path: positiveEntryPath(entry.id),
    body: {
      kind: entry.kind,
      text: entry.text,
      at: entry.at,
      updatedAt: entry.updatedAt ?? new Date().toISOString(),
    },
  });
}

/** Newest first. Entries already saved with the same text and kind are skipped. */
export function addPositive(items: { kind: PositiveKind; text: string }[], now = new Date()) {
  const current = log.get();
  const fresh = items
    .map((i) => ({ ...i, text: i.text.trim() }))
    .filter((i) => i.text && !current.some((c) => c.kind === i.kind && c.text === i.text));
  if (fresh.length === 0) return;
  const updatedAt = new Date().toISOString();
  const created = fresh.map((i) => ({
    ...i,
    id: Crypto.randomUUID(),
    at: now.toISOString(),
    updatedAt,
  }));
  log.set([...created, ...current]);
  created.forEach(send);
}

export function removePositive(id: string) {
  log.set(log.get().filter((e) => e.id !== id));
  queueChange({
    key: `positive-entries:${id}`,
    kind: 'positive-entries',
    method: 'DELETE',
    path: positiveEntryPath(id),
  });
}

export function applyServerPositiveEntries(items: ServerPositiveEntry[]) {
  setNewestFirst(
    mergeServerItems(log.get(), items, (item) => ({
      id: item.id,
      kind: item.kind,
      text: item.text,
      at: item.at,
      updatedAt: item.updatedAt,
    }))
  );
}

export function uploadLocalPositiveEntries(serverItems: ServerPositiveEntry[]) {
  notOnServer(log.get(), serverItems).forEach(send);
}

export function clearLocalPositiveEntries() {
  log.set([]);
}

registerSyncKind<ServerPositiveEntry>({
  name: 'positive-entries',
  path: POSITIVE_ENTRIES_PATH,
  applyServerItems: applyServerPositiveEntries,
  uploadLocal: uploadLocalPositiveEntries,
  clearLocal: clearLocalPositiveEntries,
});
