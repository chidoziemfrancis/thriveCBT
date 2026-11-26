import { COMMON_ERRORS } from '../error-codes.js';

export const HEALTH_ERRORS = {
  DATABASE_DOWN: {
    ...COMMON_ERRORS.SERVICE_UNAVAILABLE,
    code: 'HEALTH_DATABASE_DOWN',
  },
} as const;
