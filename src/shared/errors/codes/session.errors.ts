import { HttpStatus } from '@nestjs/common';

export const SESSION_ERRORS = {
  NOT_FOUND: {
    code: 'SESSION_NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    message: 'There are 8 sessions, numbered 1 to 8.',
  },
} as const;
