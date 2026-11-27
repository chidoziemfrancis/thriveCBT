import { HttpStatus } from '@nestjs/common';

export const ASSIGNMENT_ERRORS = {
  CODE_NOT_FOUND: {
    code: 'ASSIGNMENT_CODE_NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    message: 'We couldn’t find that code. Check it with your researcher.',
  },
  NO_RESEARCHER: {
    code: 'ASSIGNMENT_NO_RESEARCHER',
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message:
      'Every researcher is full right now. The study team will be in touch soon.',
  },
} as const;
