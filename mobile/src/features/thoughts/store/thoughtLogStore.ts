import * as Crypto from 'expo-crypto';
import { useSyncExternalStore } from 'react';

import { readJson, writeJson } from '@/lib/storage';
import {
  mergeServerItems,
  notOnServer,
  queueChange,
  registerSyncKind,
  withUuids,
} from '@/lib/sync';

import { THOUGHT_RECORDS_PATH, thoughtRecordPath } from '../api/thoughtLog.service';
import type { SaveThoughtRecordBody, ServerThoughtRecord } from '../types/thoughtLog.types';
import type { ThoughtRecord } from '../utils/thoughtLog';

const STORAGE_KEY = 'thought_log';

let records: ThoughtRecord[] = load();
const listeners = new Set<() => void>();

function load(): ThoughtRecord[] {
  const saved = readJson<ThoughtRecord[]>(STORAGE_KEY, []);
  const fixed = withUuids(saved, Crypto.randomUUID);
  if (fixed) writeJson(STORAGE_KEY, fixed);
  return fixed ?? saved;
}

function save(next: ThoughtRecord[]) {
  records = [...next].sort((a, b) => b.at.localeCompare(a.at));
  writeJson(STORAGE_KEY, records);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Newest first. */
export function useThoughtLog(): ThoughtRecord[] {
  return useSyncExternalStore(subscribe, () => records);
}

export function getThoughtLog(): ThoughtRecord[] {
  return records;
}

function toServer(record: ThoughtRecord): SaveThoughtRecordBody {
  return {
    situation: record.situation,
    thought: record.thought,
    feeling: record.feeling,
    action: record.action ?? null,
    traps: record.traps,
    sessionId: record.sessionId ?? null,
    balanced: record.balanced ?? null,
    beliefBefore: record.beliefBefore ?? null,
    beliefAfter: record.beliefAfter ?? null,
    at: record.at,
    updatedAt: record.updatedAt ?? new Date().toISOString(),
  };
}

// Saved on the phone first, so it works offline; the sync engine sends it when it can.
function send(record: ThoughtRecord) {
  queueChange({
    key: `thought-records:${record.id}`,
    kind: 'thought-records',
    method: 'PUT',
    path: thoughtRecordPath(record.id),
    body: toServer(record),
  });
}

export function addThoughtRecord(
  record: Omit<ThoughtRecord, 'id' | 'at' | 'updatedAt'>,
  now = new Date()
) {
  const created: ThoughtRecord = {
    ...record,
    id: Crypto.randomUUID(),
    at: now.toISOString(),
    updatedAt: new Date().toISOString(),
  };
  save([created, ...records]);
  send(created);
  return created;
}

function fromServer(item: ServerThoughtRecord): ThoughtRecord {
  return {
    id: item.id,
    at: item.at,
    situation: item.situation,
    thought: item.thought,
    feeling: item.feeling,
    traps: item.traps,
    ...(item.action ? { action: item.action } : {}),
    ...(item.sessionId !== null ? { sessionId: item.sessionId } : {}),
    ...(item.balanced ? { balanced: item.balanced } : {}),
    ...(item.beliefBefore !== null ? { beliefBefore: item.beliefBefore } : {}),
    ...(item.beliefAfter !== null ? { beliefAfter: item.beliefAfter } : {}),
    updatedAt: item.updatedAt,
  };
}

export function applyServerThoughtRecords(items: ServerThoughtRecord[]) {
  save(mergeServerItems(records, items, fromServer));
}

export function uploadLocalThoughtRecords(serverItems: ServerThoughtRecord[]) {
  notOnServer(records, serverItems).forEach(send);
}

export function clearLocalThoughtRecords() {
  save([]);
}

registerSyncKind<ServerThoughtRecord>({
  name: 'thought-records',
  path: THOUGHT_RECORDS_PATH,
  applyServerItems: applyServerThoughtRecords,
  uploadLocal: uploadLocalThoughtRecords,
  clearLocal: clearLocalThoughtRecords,
});
