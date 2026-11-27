import { HttpStatus } from '@nestjs/common';

export const WITHDRAWAL_ERRORS = {
  CONFIRM_MISMATCH: {
    code: 'WITHDRAW_CONFIRM_MISMATCH',
    status: HttpStatus.BAD_REQUEST,
    message: 'Type WITHDRAW to confirm.',
  },
} as const;
