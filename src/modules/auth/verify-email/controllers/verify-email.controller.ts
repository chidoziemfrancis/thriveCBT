import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { STRICT_RATE_LIMIT } from '../../../../shared/constants/rate-limits.js';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator.js';
import { AUTH_ERRORS } from '../../../../shared/errors/codes/auth.errors.js';
import { COMMON_ERRORS } from '../../../../shared/errors/error-codes.js';
import {
  ApiErrors,
  ApiZodBody,
  ApiZodResponse,
} from '../../../../shared/openapi/zod-openapi.js';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe.js';
import type { AuthUser } from '../../../../shared/types/auth-user.js';
import {
  type UserDto,
  userSchema,
} from '../../../users/accounts/dto/user.dto.js';
import {
  type VerifyEmailBody,
  verifyEmailSchema,
} from '../dto/verify-email.dto.js';
import { VerifyEmailService } from '../services/verify-email.service.js';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth/verify-email')
export class VerifyEmailController {
  constructor(private readonly verifyEmail: VerifyEmailService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Throttle(STRICT_RATE_LIMIT)
  @ApiOperation({
    operationId: 'verifyEmail',
    summary: 'Confirm the email address with the 6-digit code',
  })
  @ApiZodBody(verifyEmailSchema)
  @ApiZodResponse(200, userSchema, 'Email confirmed')
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    COMMON_ERRORS.UNAUTHENTICATED,
    AUTH_ERRORS.CODE_INVALID,
    AUTH_ERRORS.CODE_EXPIRED,
    AUTH_ERRORS.CODE_TOO_MANY_TRIES,
  )
  verify(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(verifyEmailSchema)) body: VerifyEmailBody,
  ): Promise<UserDto> {
    return this.verifyEmail.verify(user.id, body.code);
  }

  @Post('resend')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle(STRICT_RATE_LIMIT)
  @ApiOperation({
    operationId: 'resendVerifyEmail',
    summary: 'Send a new code; the old one stops working',
  })
  @ApiErrors(COMMON_ERRORS.UNAUTHENTICATED, COMMON_ERRORS.RATE_LIMITED)
  async resend(@CurrentUser() user: AuthUser): Promise<void> {
    await this.verifyEmail.resend(user.id);
  }
}
