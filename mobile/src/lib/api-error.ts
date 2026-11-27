import { isAxiosError } from 'axios';

/** Codes made by the app itself, for failures that never reach the server. */
export const CLIENT_ERRORS = {
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
} as const;

type ErrorBody = {
  error?: { code?: string; message?: string; details?: unknown; requestId?: string };
};

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status?: number,
    readonly details?: unknown,
    readonly requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const GENERIC_MESSAGE = 'Something went wrong on our side. Please try again.';

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!isAxiosError(error)) return new ApiError('INTERNAL', GENERIC_MESSAGE);

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError(
      CLIENT_ERRORS.TIMEOUT,
      'The server took too long to answer. Please try again.'
    );
  }
  const { response } = error;
  if (!response) {
    return new ApiError(
      CLIENT_ERRORS.NETWORK,
      'You seem to be offline. Check your connection and try again.'
    );
  }
  const body = (response.data as ErrorBody | undefined)?.error;
  if (body?.code) {
    return new ApiError(
      body.code,
      body.message ?? GENERIC_MESSAGE,
      response.status,
      body.details,
      body.requestId
    );
  }
  return new ApiError('INTERNAL', GENERIC_MESSAGE, response.status);
}

/** The first message for each field in a VALIDATION_FAILED error, keyed by field name. */
export function fieldErrors(error: ApiError): Record<string, string> {
  const fields =
    (error.details as { fields?: { path: string; message: string }[] } | undefined)?.fields ?? [];
  const result: Record<string, string> = {};
  for (const { path, message } of fields) result[path] ??= message;
  return result;
}

export function isOffline(error: ApiError) {
  return error.code === CLIENT_ERRORS.NETWORK || error.code === CLIENT_ERRORS.TIMEOUT;
}
