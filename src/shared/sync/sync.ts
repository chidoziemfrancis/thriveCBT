import { AppError } from '../errors/app-error.js';
import { SYNC_ERRORS } from '../errors/codes/sync.errors.js';

/**
 * Refuses a change older than the one already saved, sending the saved one back so the phone
 * can take it. A change with the same time is a repeat of one already saved, so it's let
 * through and simply saved again.
 */
export function assertNotStale<T>(
  saved: { updatedAt: Date } | null,
  incoming: Date,
  current: () => T,
): void {
  if (saved && saved.updatedAt.getTime() > incoming.getTime()) {
    throw new AppError(SYNC_ERRORS.STALE_UPDATE, {
      details: { current: current() },
    });
  }
}
