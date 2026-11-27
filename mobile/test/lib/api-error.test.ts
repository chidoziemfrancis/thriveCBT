import { describe, expect, it } from '@jest/globals';
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';

import { ApiError, fieldErrors, isOffline, toApiError } from '@/lib/api-error';
import { shouldRetryQuery } from '@/lib/query-client';

function responseError(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() };
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError('failed', 'ERR_BAD_RESPONSE', config, {}, response);
}

describe('toApiError', () => {
  it('keeps the server’s code, message, details and request id', () => {
    const error = toApiError(
      responseError(409, {
        error: {
          code: 'AUTH_EMAIL_TAKEN',
          message: 'Taken.',
          details: { a: 1 },
          requestId: 'req-1',
        },
      })
    );
    expect(error).toMatchObject({
      code: 'AUTH_EMAIL_TAKEN',
      message: 'Taken.',
      status: 409,
      requestId: 'req-1',
    });
  });

  it('names offline and slow failures with the app’s own codes', () => {
    const offline = toApiError(
      new AxiosError('Network Error', 'ERR_NETWORK', { headers: new AxiosHeaders() })
    );
    const slow = toApiError(
      new AxiosError('timeout', 'ECONNABORTED', { headers: new AxiosHeaders() })
    );
    expect(offline.code).toBe('NETWORK_ERROR');
    expect(slow.code).toBe('TIMEOUT');
    expect(isOffline(offline) && isOffline(slow)).toBe(true);
  });

  it('turns anything unexpected into a generic INTERNAL error', () => {
    expect(toApiError(responseError(502, '<html>bad gateway</html>'))).toMatchObject({
      code: 'INTERNAL',
      status: 502,
    });
    expect(toApiError(new Error('boom')).code).toBe('INTERNAL');
  });

  it('passes an ApiError through unchanged', () => {
    const error = new ApiError('FORBIDDEN', 'No.');
    expect(toApiError(error)).toBe(error);
  });
});

describe('fieldErrors', () => {
  it('keeps the first message for each field', () => {
    const error = new ApiError('VALIDATION_FAILED', 'Bad', 400, {
      fields: [
        { path: 'password', message: 'At least 8 characters' },
        { path: 'password', message: 'Include a number' },
        { path: 'email', message: 'Invalid email' },
      ],
    });
    expect(fieldErrors(error)).toEqual({
      password: 'At least 8 characters',
      email: 'Invalid email',
    });
  });
});

describe('shouldRetryQuery', () => {
  it('retries once, and only when the phone could not reach the server', () => {
    const offline = new ApiError('NETWORK_ERROR', 'Offline');
    expect(shouldRetryQuery(0, offline)).toBe(true);
    expect(shouldRetryQuery(1, offline)).toBe(false);
    expect(shouldRetryQuery(0, new ApiError('NOT_FOUND', 'Gone', 404))).toBe(false);
  });
});
