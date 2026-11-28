import { AppState } from 'react-native';

import { useSessionStore } from '@/stores/session.store';

import { type ApiError, isOffline, toApiError } from '../api-error';
import { api } from '../axios';
import { readJson, removeKey, writeJson } from '../storage';
import {
  clearQueue,
  dequeue,
  enqueue,
  markFailed,
  type NewChange,
  type QueuedChange,
  readQueue,
} from './queue';

/** How one kind of student data syncs: where it lives and how server items land on the phone. */
export type SyncKind<Item> = {
  name: string;
  /** The list route, e.g. `/me/sessions`; pulled with `?since=`. */
  path: string;
  /** Puts the server's items into the phone's store; the newest change wins. */
  applyServerItems: (items: Item[]) => void;
  /** Runs once before the first pull on this phone, to send anything saved before sync existed. */
  uploadLocal?: (serverItems: Item[]) => void;
  /** Empties the phone's store when a different student signs in on this phone. */
  clearLocal: () => void;
};

type SyncList<Item> = { items: Item[]; serverTime: string };

const kinds = new Map<string, SyncKind<unknown>>();
const phoneOnly = new Set<() => void>();

/**
 * For a student's data that lives only on the phone (answers in progress, phone copies of
 * server data, things not synced yet): cleared when a different student signs in here.
 */
export function onStudentChange(clear: () => void) {
  phoneOnly.add(clear);
}

export function registerSyncKind<Item>(kind: SyncKind<Item>) {
  kinds.set(kind.name, kind as SyncKind<unknown>);
}

const sinceKey = (name: string) => `sync_since:${name}`;

/** Saves a change to the server when it can; until then it waits on the phone. */
export function queueChange(change: NewChange) {
  enqueue(change);
  scheduleSync(0);
}

const OWNER_KEY = 'sync_owner';

function signedInStudent(): string | null {
  const { status, user } = useSessionStore.getState();
  return status === 'signedIn' && user?.role === 'student' ? user.id : null;
}

/**
 * Waiting changes and synced copies belong to one student. When someone else signs in on this
 * phone, they're cleared before anything is sent, so one student's data never reaches another's
 * account. The same student signing back in keeps everything, offline changes included.
 */
function claimPhoneFor(studentId: string) {
  const owner = readJson<string | null>(OWNER_KEY, null);
  if (owner === studentId) return;
  // The first sync on a phone keeps what's there: it was saved before sync existed and is sent
  // up by `uploadLocal`.
  if (owner === null) {
    writeJson(OWNER_KEY, studentId);
    return;
  }
  clearQueue();
  for (const kind of kinds.values()) {
    removeKey(sinceKey(kind.name));
    kind.clearLocal();
  }
  phoneOnly.forEach((clear) => clear());
  writeJson(OWNER_KEY, studentId);
}

/** Sends waiting changes oldest first. Stops at the first one the phone can't send yet. */
async function flush(now = Date.now()): Promise<void> {
  for (const change of readQueue()) {
    if (change.notBefore > now) return;
    try {
      if (change.method === 'PUT') await api.put(change.path, change.body);
      else await api.delete(change.path);
      dequeue(change);
    } catch (error) {
      const apiError = toApiError(error);
      if (handleRejected(change, apiError)) continue;
      markFailed(change, now);
      return;
    }
  }
}

/**
 * True when the server has settled this change for good, so it leaves the queue: a newer
 * change was already saved (the server's copy is taken), or the server will never accept it.
 * Offline, timeouts, rate limits and server errors are tried again later.
 */
function handleRejected(change: QueuedChange, error: ApiError): boolean {
  if (isOffline(error) || error.status === undefined || error.status >= 500) return false;
  if (error.status === 401 || error.status === 429) return false;
  if (error.code === 'SYNC_STALE_UPDATE') {
    const current = (error.details as { current?: unknown } | undefined)?.current;
    if (current) kinds.get(change.kind)?.applyServerItems([current]);
  }
  dequeue(change);
  return true;
}

async function pull(kind: SyncKind<unknown>) {
  const since = readJson<string | null>(sinceKey(kind.name), null);
  const { data } = await api.get<SyncList<unknown>>(kind.path, {
    params: since ? { since } : undefined,
  });
  if (!since) kind.uploadLocal?.(data.items);
  kind.applyServerItems(data.items);
  writeJson(sinceKey(kind.name), data.serverTime);
}

let running: Promise<void> | null = null;

/** Sends the queue, then pulls every kind. Only one runs at a time; others share it. */
export function syncNow(): Promise<void> {
  const studentId = signedInStudent();
  if (!studentId) return Promise.resolve();
  running ??= (async () => {
    try {
      claimPhoneFor(studentId);
      await flush();
      for (const kind of kinds.values()) await pull(kind);
      // Changes made while uploading local data go out straight away.
      await flush();
    } catch {
      // Offline or the server is unwell: the queue stays, and the next try picks it up.
    } finally {
      running = null;
      scheduleNextTry();
    }
  })();
  return running;
}

let timer: ReturnType<typeof setTimeout> | null = null;

function scheduleSync(delayMs: number) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void syncNow();
  }, delayMs);
}

function scheduleNextTry(now = Date.now()) {
  const waiting = readQueue();
  if (waiting.length === 0) return;
  const soonest = Math.min(...waiting.map((c) => c.notBefore));
  scheduleSync(Math.max(soonest - now, 1_000));
}

/** Syncs now and whenever the app comes back to the front. Returns a stop function. */
export function startSync(): () => void {
  void syncNow();
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') void syncNow();
  });
  return () => {
    subscription.remove();
    if (timer) clearTimeout(timer);
    timer = null;
  };
}

/** Sends what's waiting before signing out, for a few seconds at most. */
export async function syncBeforeSignOut(waitMs = 3_000) {
  await Promise.race([syncNow(), new Promise((resolve) => setTimeout(resolve, waitMs))]);
}
