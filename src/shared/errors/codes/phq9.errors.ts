import { HttpStatus } from '@nestjs/common';

export const PHQ9_ERRORS = {
  BASELINE_FIRST: {
    code: 'PHQ9_BASELINE_FIRST',
    status: HttpStatus.CONFLICT,
    message: 'The first check-in needs to be done before the final one.',
  },
  FINAL_NOT_OPEN: {
    code: 'PHQ9_FINAL_NOT_OPEN',
    status: HttpStatus.CONFLICT,
    message: 'The final check-in opens once Session 8 is finished.',
  },
} as const;
