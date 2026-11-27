import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { STRICT_RATE_LIMIT } from '../../../../shared/constants/rate-limits.js';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator.js';
import { Public } from '../../../../shared/decorators/public.decorator.js';
import { Roles } from '../../../../shared/decorators/roles.decorator.js';
import { AUTH_ERRORS } from '../../../../shared/errors/codes/auth.errors.js';
import { EMAIL_ERRORS } from '../../../../shared/errors/codes/email.errors.js';
import { COMMON_ERRORS } from '../../../../shared/errors/error-codes.js';
import {
  ApiErrors,
  ApiZodBody,
  ApiZodResponse,
} from '../../../../shared/openapi/zod-openapi.js';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe.js';
import type { AuthUser } from '../../../../shared/types/auth-user.js';
import { sessionSchema, type SessionDto } from '../../login/dto/session.dto.js';
import {
  type AcceptInviteBody,
  acceptInviteSchema,
  type CreateInviteBody,
  createInviteSchema,
  type InviteDto,
  inviteSchema,
} from '../dto/invites.dto.js';
import { InvitesService } from '../services/invites.service.js';

@Controller()
export class InvitesController {
  constructor(private readonly invites: InvitesService) {}

  @Post('admin/researcher-invites')
  @Roles('lead')
  @ApiTags('admin')
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'inviteResearcher',
    summary: 'Email a researcher an invite to set up their account',
  })
  @ApiZodBody(createInviteSchema)
  @ApiZodResponse(
    201,
    inviteSchema,
    'Invite sent; any earlier invite to the same email stops working',
  )
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    COMMON_ERRORS.UNAUTHENTICATED,
    COMMON_ERRORS.FORBIDDEN,
    AUTH_ERRORS.INVITE_EMAIL_TAKEN,
    EMAIL_ERRORS.SEND_FAILED,
  )
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createInviteSchema)) body: CreateInviteBody,
  ): Promise<InviteDto> {
    return this.invites.create(user.id, body);
  }

  @Post('auth/invites/accept')
  @Public()
  @Throttle(STRICT_RATE_LIMIT)
  @HttpCode(HttpStatus.OK)
  @ApiTags('auth')
  @ApiOperation({
    operationId: 'acceptInvite',
    summary: 'Set a password from an invite and log in as a researcher',
  })
  @ApiZodBody(acceptInviteSchema)
  @ApiZodResponse(
    200,
    sessionSchema,
    'Researcher account created and logged in',
  )
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    AUTH_ERRORS.INVITE_INVALID,
    AUTH_ERRORS.INVITE_EXPIRED,
    AUTH_ERRORS.INVITE_EMAIL_TAKEN,
    COMMON_ERRORS.RATE_LIMITED,
  )
  accept(
    @Body(new ZodValidationPipe(acceptInviteSchema)) body: AcceptInviteBody,
  ): Promise<SessionDto> {
    return this.invites.accept(body);
  }
}
