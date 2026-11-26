import type { ErrorDefinition } from './error-codes.js';

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    definition: ErrorDefinition,
    options: { details?: unknown; message?: string; cause?: unknown } = {},
  ) {
    super(options.message ?? definition.message, { cause: options.cause });
    this.name = 'AppError';
    this.code = definition.code;
    this.status = definition.status;
    this.details = options.details;
  }
}
