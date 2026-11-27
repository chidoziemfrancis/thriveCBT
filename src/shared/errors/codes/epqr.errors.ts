import { HttpStatus } from '@nestjs/common';

export const EPQR_ERRORS = {
  NOT_TAKEN: {
    code: 'EPQR_NOT_TAKEN',
    status: HttpStatus.NOT_FOUND,
    message: 'The personality questions haven’t been answered yet.',
  },
} as const;
