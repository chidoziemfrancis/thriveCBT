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
  CODE_INVALID: {
    code: 'AUTH_CODE_INVALID',
    status: HttpStatus.BAD_REQUEST,
    message: 'That code isn’t right. Check the email and try again.',
  },
  CODE_EXPIRED: {
    code: 'AUTH_CODE_EXPIRED',
    status: HttpStatus.BAD_REQUEST,
    message: 'That code has expired. Ask for a new one.',
  },
  CODE_TOO_MANY_TRIES: {
    code: 'AUTH_CODE_TOO_MANY_TRIES',
    status: HttpStatus.TOO_MANY_REQUESTS,
    message: 'Too many wrong codes. Ask for a new one.',
  },
  INVITE_INVALID: {
    code: 'AUTH_INVITE_INVALID',
    status: HttpStatus.BAD_REQUEST,
    message: 'This invite link isn’t valid. Ask the study lead for a new one.',
  },
  INVITE_EXPIRED: {
    code: 'AUTH_INVITE_EXPIRED',
    status: HttpStatus.BAD_REQUEST,
    message: 'This invite has expired. Ask the study lead for a new one.',
  },
  INVITE_EMAIL_TAKEN: {
    code: 'AUTH_INVITE_EMAIL_TAKEN',
    status: HttpStatus.CONFLICT,
    message: 'That email already has an account.',
  },
} as const;
