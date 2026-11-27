import { HttpStatus } from '@nestjs/common';

export type ErrorDefinition = {
  code: string;
  status: HttpStatus;
  message: string;
};

export const COMMON_ERRORS = {
  VALIDATION_FAILED: {
    code: 'VALIDATION_FAILED',
    status: HttpStatus.BAD_REQUEST,
    message: 'Some fields are missing or invalid.',
  },
  UNAUTHENTICATED: {
    code: 'UNAUTHENTICATED',
    status: HttpStatus.UNAUTHORIZED,
    message: 'Please log in again.',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    status: HttpStatus.FORBIDDEN,
    message: 'You don’t have access to this.',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    status: HttpStatus.NOT_FOUND,
    message: 'We couldn’t find that.',
  },
  CONFLICT: {
    code: 'CONFLICT',
    status: HttpStatus.CONFLICT,
    message: 'That already exists.',
  },
  PAYLOAD_TOO_LARGE: {
    code: 'PAYLOAD_TOO_LARGE',
    status: HttpStatus.PAYLOAD_TOO_LARGE,
    message: 'That request is too large.',
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    status: HttpStatus.TOO_MANY_REQUESTS,
    message: 'Too many attempts. Please wait a moment and try again.',
  },
  INTERNAL: {
    code: 'INTERNAL',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Something went wrong on our side. Please try again.',
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'The service is briefly unavailable. Please try again shortly.',
  },
} as const satisfies Record<string, ErrorDefinition>;
