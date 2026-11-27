import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import { AppError } from '../errors/app-error.js';
import { COMMON_ERRORS } from '../errors/error-codes.js';
import type { AuthRole, AuthUser } from '../types/auth-user.js';

const ROLES: AuthRole[] = ['student', 'researcher', 'lead'];

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token)
      throw new AppError(COMMON_ERRORS.UNAUTHENTICATED);

    let payload: { sub?: unknown; role?: unknown };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch (cause) {
      throw new AppError(COMMON_ERRORS.UNAUTHENTICATED, { cause });
    }
    if (
      typeof payload.sub !== 'string' ||
      !ROLES.includes(payload.role as AuthRole)
    ) {
      throw new AppError(COMMON_ERRORS.UNAUTHENTICATED);
    }

    const user: AuthUser = { id: payload.sub, role: payload.role as AuthRole };
    request.user = user;
    return true;
  }
}
