import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

import type { ErrorResponse } from './error-response.js';
import { toAppError } from './to-app-error.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const error = toAppError(exception);

    if (error.status >= 500) {
      this.logger.error(
        { err: error.cause ?? error, code: error.code },
        error.message,
      );
    } else {
      this.logger.warn(
        { code: error.code, status: error.status },
        error.message,
      );
    }

    const body: ErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
        requestId: String(request.id ?? ''),
      },
    };
    response.status(error.status).json(body);
  }
}
