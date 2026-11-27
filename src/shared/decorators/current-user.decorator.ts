import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { AppError } from '../errors/app-error.js';
import { COMMON_ERRORS } from '../errors/error-codes.js';
import type { AuthUser } from '../types/auth-user.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const user = context.switchToHttp().getRequest<Request>().user;
    if (!user) throw new AppError(COMMON_ERRORS.UNAUTHENTICATED);
    return user;
  },
);
