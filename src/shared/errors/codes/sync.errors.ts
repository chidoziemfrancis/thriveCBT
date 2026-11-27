import { HttpStatus } from '@nestjs/common';

export const SYNC_ERRORS = {
  STALE_UPDATE: {
    code: 'SYNC_STALE_UPDATE',
    status: HttpStatus.CONFLICT,
    message: 'A newer change was already saved, so this one was skipped.',
  },
} as const;
