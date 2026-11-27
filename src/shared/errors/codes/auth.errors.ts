import { HttpStatus } from '@nestjs/common';

export const AUTH_ERRORS = {
  EMAIL_TAKEN: {
    code: 'AUTH_EMAIL_TAKEN',
    status: HttpStatus.CONFLICT,
    message:
      'An account with that email already exists. Try logging in instead.',
  },
  INVALID_CREDENTIALS: {
    code: 'AUTH_INVALID_CREDENTIALS',
    status: HttpStatus.UNAUTHORIZED,
    message: 'That email and password don’t match.',
  },
  TOKEN_INVALID: {
    code: 'AUTH_TOKEN_INVALID',
    status: HttpStatus.UNAUTHORIZED,
    message: 'Please log in again.',
  },
  TOKEN_EXPIRED: {
    code: 'AUTH_TOKEN_EXPIRED',
    status: HttpStatus.UNAUTHORIZED,
    message: 'Your session has ended. Please log in again.',
  },
  TOKEN_REUSED: {
    code: 'AUTH_TOKEN_REUSED',
    status: HttpStatus.UNAUTHORIZED,
    message:
      'For your safety you’ve been logged out everywhere. Please log in again.',
  },
  ACCOUNT_SUSPENDED: {
    code: 'AUTH_ACCOUNT_SUSPENDED',
    status: HttpStatus.FORBIDDEN,
    message: 'This account is paused. Please contact the research team.',
  },
} as const;
