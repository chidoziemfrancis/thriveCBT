import { HttpStatus } from '@nestjs/common';

export const STUDY_ERRORS = {
  CONSENT_REQUIRED: {
    code: 'CONSENT_REQUIRED',
    status: HttpStatus.FORBIDDEN,
    message: 'Please read and agree to the study information first.',
  },
  WITHDRAWN: {
    code: 'STUDY_WITHDRAWN',
    status: HttpStatus.FORBIDDEN,
    message: 'You’ve left the study, so nothing more can be saved.',
  },
} as const;
