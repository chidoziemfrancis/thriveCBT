import { readJson, removeKey, writeJson } from '../storage';

const QUEUE_KEY = 'sync_queue';

/** A change waiting to reach the server. Kept on the phone so it survives the app closing. */
export type QueuedChange = {
  /** One entry per thing changed: a newer change to the same thing replaces the waiting one. */
  key: string;
  kind: string;
  method: 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  /** Tells a change apart from a newer one to the same thing that replaced it. */
  version: number;
  attempts: number;
  /** Not tried again before this time (ms), growing after each failure. */
  notBefore: number;
};

export function readQueue(): QueuedChange[] {
  return readJson<QueuedChange[]>(QUEUE_KEY, []);
}

function writeQueue(queue: QueuedChange[]) {
  writeJson(QUEUE_KEY, queue);
}

let lastVersion = 0;

export type NewChange = Omit<QueuedChange, 'version' | 'attempts' | 'notBefore'>;

/** Adds a change at the back, replacing any waiting change to the same thing. */
export function enqueue(change: NewChange) {
  lastVersion = Math.max(Date.now(), lastVersion + 1);
  writeQueue([
    ...readQueue().filter((c) => c.key !== change.key),
    { ...change, version: lastVersion, attempts: 0, notBefore: 0 },
  ]);
}

/** Removes a change once it's saved, unless a newer one replaced it in the meantime. */
export function dequeue(sent: QueuedChange) {
  writeQueue(readQueue().filter((c) => !(c.key === sent.key && c.version === sent.version)));
}

const BASE_DELAY_MS = 5_000;
const MAX_DELAY_MS = 5 * 60_000;

/** 5s, 10s, 20s… up to 5 minutes between tries. */
export function retryDelay(attempts: number): number {
  return Math.min(BASE_DELAY_MS * 2 ** Math.max(attempts - 1, 0), MAX_DELAY_MS);
}

export function markFailed(change: QueuedChange, now = Date.now()) {
  writeQueue(
    readQueue().map((c) =>
      c.key === change.key && c.version === change.version
        ? { ...c, attempts: c.attempts + 1, notBefore: now + retryDelay(c.attempts + 1) }
        : c
    )
  );
}

export function clearQueue() {
  removeKey(QUEUE_KEY);
}
