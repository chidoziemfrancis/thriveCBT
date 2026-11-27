import { AppError } from '../errors/app-error.js';
import { SYNC_ERRORS } from '../errors/codes/sync.errors.js';
import { COMMON_ERRORS } from '../errors/error-codes.js';

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

export function assertCanChange<T>(
  saved: { studentId: string; updatedAt: Date; deletedAt: Date | null } | null,
  studentId: string,
  incoming: Date,
  current: () => T,
  { revive = false }: { revive?: boolean } = {},
): void {
  if (saved && saved.studentId !== studentId)
    throw new AppError(COMMON_ERRORS.NOT_FOUND);
  if (
    saved?.deletedAt &&
    revive &&
    incoming.getTime() > saved.deletedAt.getTime()
  )
    return;
  if (saved?.deletedAt) {
    throw new AppError(SYNC_ERRORS.STALE_UPDATE, {
      details: { current: current() },
    });
  }
  assertNotStale(saved, incoming, current);
}
