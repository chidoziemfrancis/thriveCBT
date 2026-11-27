import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { STRICT_RATE_LIMIT } from '../../../../shared/constants/rate-limits.js';
import { Public } from '../../../../shared/decorators/public.decorator.js';
import { AUTH_ERRORS } from '../../../../shared/errors/codes/auth.errors.js';
import { COMMON_ERRORS } from '../../../../shared/errors/error-codes.js';
import {
  ApiErrors,
  ApiZodBody,
} from '../../../../shared/openapi/zod-openapi.js';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe.js';
import {
  type ResetConfirmBody,
  type ResetRequestBody,
  resetConfirmSchema,
  resetRequestSchema,
} from '../dto/password-reset.dto.js';
import { PasswordResetService } from '../services/password-reset.service.js';

@ApiTags('auth')
@Public()
@Throttle(STRICT_RATE_LIMIT)
@Controller('auth/password-reset')
export class PasswordResetController {
  constructor(private readonly passwordReset: PasswordResetService) {}

  @Post('request')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'requestPasswordReset',
    summary: 'Email a reset code, if the account exists',
  })
  @ApiZodBody(resetRequestSchema)
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, COMMON_ERRORS.RATE_LIMITED)
  async request(
    @Body(new ZodValidationPipe(resetRequestSchema)) body: ResetRequestBody,
  ): Promise<void> {
    await this.passwordReset.request(body.email);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'confirmPasswordReset',
    summary: 'Set a new password with the code; logs out every device',
  })
  @ApiZodBody(resetConfirmSchema)
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    AUTH_ERRORS.CODE_INVALID,
    AUTH_ERRORS.CODE_EXPIRED,
    AUTH_ERRORS.CODE_TOO_MANY_TRIES,
    COMMON_ERRORS.RATE_LIMITED,
  )
  async confirm(
    @Body(new ZodValidationPipe(resetConfirmSchema)) body: ResetConfirmBody,
  ): Promise<void> {
    await this.passwordReset.confirm(body);
  }
}
