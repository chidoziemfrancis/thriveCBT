import { HttpStatus } from '@nestjs/common';

export const EMAIL_ERRORS = {
  SEND_FAILED: {
    code: 'EMAIL_SEND_FAILED',
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message:
      'We couldn’t send the email just now. Please try again in a moment.',
  },
} as const;
