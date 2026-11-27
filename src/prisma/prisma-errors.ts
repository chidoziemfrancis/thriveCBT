import { AppError } from '../shared/errors/app-error.js';
import { COMMON_ERRORS } from '../shared/errors/error-codes.js';

const UNREACHABLE_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017']);
const UNREACHABLE_CAUSES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
]);

type MaybePrismaError = { name?: unknown; code?: unknown; cause?: unknown };

function causeCode(error: MaybePrismaError): unknown {
  return (error.cause as { code?: unknown } | undefined)?.code;
}

// Matched by name and code so this works without loading the generated client.
export function fromPrismaError(exception: unknown): AppError | undefined {
  if (typeof exception !== 'object' || exception === null) return undefined;
  const error = exception as MaybePrismaError;
  const name = typeof error.name === 'string' ? error.name : '';

  if (name === 'PrismaClientKnownRequestError') {
    if (error.code === 'P2002')
      return new AppError(COMMON_ERRORS.CONFLICT, { cause: exception });
    if (error.code === 'P2025')
      return new AppError(COMMON_ERRORS.NOT_FOUND, { cause: exception });
  }

  const unreachable =
    name === 'PrismaClientInitializationError' ||
    UNREACHABLE_CODES.has(String(error.code)) ||
    UNREACHABLE_CAUSES.has(String(causeCode(error)));
  if (name.startsWith('Prisma') || name === 'DriverAdapterError') {
    if (unreachable)
      return new AppError(COMMON_ERRORS.SERVICE_UNAVAILABLE, {
        cause: exception,
      });
  }

  return undefined;
}
