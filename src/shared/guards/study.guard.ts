import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { UserStatus } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { STUDY_DATA_KEY } from '../decorators/study-data.decorator.js';
import { AppError } from '../errors/app-error.js';
import { STUDY_ERRORS } from '../errors/codes/study.errors.js';
import { COMMON_ERRORS } from '../errors/error-codes.js';

// Checked on every study data call, not only at sign-in, because an access token stays valid for
// a few minutes after the student withdraws.
@Injectable()
export class StudyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isStudyData = this.reflector.getAllAndOverride<boolean>(
      STUDY_DATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!isStudyData) return true;

    const user = context.switchToHttp().getRequest<Request>().user;
    if (!user) throw new AppError(COMMON_ERRORS.UNAUTHENTICATED);
    const account = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { status: true, consents: { select: { id: true }, take: 1 } },
    });
    if (!account) throw new AppError(COMMON_ERRORS.UNAUTHENTICATED);
    if (account.status === UserStatus.WITHDRAWN)
      throw new AppError(STUDY_ERRORS.WITHDRAWN);
    if (account.consents.length === 0)
      throw new AppError(STUDY_ERRORS.CONSENT_REQUIRED);
    return true;
  }
}
