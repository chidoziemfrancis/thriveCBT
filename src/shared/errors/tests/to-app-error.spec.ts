import {
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { z } from 'zod';

import { AppError } from '../app-error.js';
import { COMMON_ERRORS } from '../error-codes.js';
import { toAppError } from '../to-app-error.js';

describe('toAppError', () => {
  it('passes an AppError through unchanged', () => {
    const error = new AppError(COMMON_ERRORS.CONFLICT, {
      details: { field: 'email' },
    });
    expect(toAppError(error)).toBe(error);
  });

  it('lists each failing field for Zod errors', () => {
    const result = z
      .object({ age: z.number(), email: z.email() })
      .safeParse({ age: 'x', email: 'no' });
    const error = toAppError(result.error);
    expect(error).toMatchObject({ code: 'VALIDATION_FAILED', status: 400 });
    expect(error.details).toEqual({
      fields: [
        { path: 'age', message: expect.any(String) },
        { path: 'email', message: expect.any(String) },
      ],
    });
  });

  it.each([
    [new NotFoundException(), 'NOT_FOUND', 404],
    [new UnauthorizedException(), 'UNAUTHENTICATED', 401],
    [new ThrottlerException(), 'RATE_LIMITED', 429],
  ])('maps NestJS errors to our codes (%#)', (exception, code, status) => {
    expect(toAppError(exception)).toMatchObject({ code, status });
  });

  it('maps body parser failures', () => {
    expect(toAppError({ type: 'entity.too.large', status: 413 })).toMatchObject(
      { code: 'PAYLOAD_TOO_LARGE' },
    );
    expect(
      toAppError({ type: 'entity.parse.failed', status: 400 }),
    ).toMatchObject({
      code: 'VALIDATION_FAILED',
      message: 'The request body isn’t valid JSON.',
    });
  });

  it('maps database errors', () => {
    const duplicate = Object.assign(new Error('x'), {
      name: 'PrismaClientKnownRequestError',
      code: 'P2002',
    });
    expect(toAppError(duplicate)).toMatchObject({
      code: 'CONFLICT',
      status: HttpStatus.CONFLICT,
    });
  });

  it('hides anything unexpected behind INTERNAL, keeping the cause for logs', () => {
    const boom = new Error('connection string postgres://secret');
    const error = toAppError(boom);
    expect(error).toMatchObject({ code: 'INTERNAL', status: 500 });
    expect(error.message).not.toContain('secret');
    expect(error.cause).toBe(boom);
  });
});
