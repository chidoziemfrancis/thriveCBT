import type { ArgumentsHost } from '@nestjs/common';
import type { PinoLogger } from 'nestjs-pino';

import { AllExceptionsFilter } from '../all-exceptions.filter.js';
import { AppError } from '../app-error.js';
import { COMMON_ERRORS } from '../error-codes.js';

function setup() {
  const logger = { setContext: vi.fn(), warn: vi.fn(), error: vi.fn() };
  const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ id: 'req-123' }),
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
  const filter = new AllExceptionsFilter(logger as unknown as PinoLogger);
  return { filter, logger, response, host };
}

describe('AllExceptionsFilter', () => {
  it('sends the shared error shape with the request id', () => {
    const { filter, response, host, logger } = setup();
    filter.catch(
      new AppError(COMMON_ERRORS.NOT_FOUND, { details: { id: 'x' } }),
      host,
    );
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: COMMON_ERRORS.NOT_FOUND.message,
        details: { id: 'x' },
        requestId: 'req-123',
      },
    });
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('logs unexpected errors with their cause but never sends it', () => {
    const { filter, response, host, logger } = setup();
    const boom = new Error('stack and secrets');
    filter.catch(boom, host);
    expect(response.status).toHaveBeenCalledWith(500);
    const body = response.json.mock.calls[0][0];
    expect(JSON.stringify(body)).not.toContain('secrets');
    expect(body.error).not.toHaveProperty('details');
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: boom, code: 'INTERNAL' }),
      expect.any(String),
    );
  });
});
