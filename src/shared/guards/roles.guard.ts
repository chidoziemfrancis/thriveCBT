import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { IS_PUBLIC } from '../decorators/public.decorator.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { AppError } from '../errors/app-error.js';
import { COMMON_ERRORS } from '../errors/error-codes.js';
import type { AuthRole } from '../types/auth-user.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets))
      return true;

    const roles = this.reflector.getAllAndOverride<AuthRole[] | undefined>(
      ROLES_KEY,
      targets,
    );
    if (!roles?.length) return true;

    const user = context.switchToHttp().getRequest<Request>().user;
    if (!user) throw new AppError(COMMON_ERRORS.UNAUTHENTICATED);
    if (!roles.includes(user.role)) throw new AppError(COMMON_ERRORS.FORBIDDEN);
    return true;
  }
}
