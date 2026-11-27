import { HttpException, HttpStatus } from '@nestjs/common';
import { ZodError } from 'zod';

import { fromPrismaError } from '../../prisma/prisma-errors.js';
import { AppError } from './app-error.js';
import { COMMON_ERRORS, type ErrorDefinition } from './error-codes.js';

const BY_STATUS: Partial<Record<number, ErrorDefinition>> = {
  [HttpStatus.BAD_REQUEST]: COMMON_ERRORS.VALIDATION_FAILED,
  [HttpStatus.UNAUTHORIZED]: COMMON_ERRORS.UNAUTHENTICATED,
  [HttpStatus.FORBIDDEN]: COMMON_ERRORS.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: COMMON_ERRORS.NOT_FOUND,
  [HttpStatus.CONFLICT]: COMMON_ERRORS.CONFLICT,
  [HttpStatus.PAYLOAD_TOO_LARGE]: COMMON_ERRORS.PAYLOAD_TOO_LARGE,
  [HttpStatus.TOO_MANY_REQUESTS]: COMMON_ERRORS.RATE_LIMITED,
  [HttpStatus.SERVICE_UNAVAILABLE]: COMMON_ERRORS.SERVICE_UNAVAILABLE,
};

function bodyParserError(exception: unknown): AppError | undefined {
  const type = (exception as { type?: unknown } | null)?.type;
  if (type === 'entity.too.large') {
    return new AppError(COMMON_ERRORS.PAYLOAD_TOO_LARGE, { cause: exception });
  }
  if (type === 'entity.parse.failed') {
    return new AppError(COMMON_ERRORS.VALIDATION_FAILED, {
      message: 'The request body isn’t valid JSON.',
      cause: exception,
    });
  }
  return undefined;
}

export function toAppError(exception: unknown): AppError {
  if (exception instanceof AppError) return exception;

  if (exception instanceof ZodError) {
    return new AppError(COMMON_ERRORS.VALIDATION_FAILED, {
      details: {
        fields: exception.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
  }

  const fromPrisma = fromPrismaError(exception);
  if (fromPrisma) return fromPrisma;

  const fromBodyParser = bodyParserError(exception);
  if (fromBodyParser) return fromBodyParser;

  if (exception instanceof HttpException) {
    return new AppError(
      BY_STATUS[exception.getStatus()] ?? COMMON_ERRORS.INTERNAL,
      {
        cause: exception,
      },
    );
  }

  return new AppError(COMMON_ERRORS.INTERNAL, { cause: exception });
}
