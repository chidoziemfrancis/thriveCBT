import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AUTH_ERRORS } from '../../../../shared/errors/codes/auth.errors.js';
import { COMMON_ERRORS } from '../../../../shared/errors/error-codes.js';
import {
  ApiErrors,
  ApiZodBody,
  ApiZodResponse,
} from '../../../../shared/openapi/zod-openapi.js';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe.js';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  type LoginBody,
  type RefreshBody,
  type RegisterBody,
} from '../dto/credentials.dto.js';
import {
  sessionSchema,
  tokenPairSchema,
  type SessionDto,
  type TokenPair,
} from '../dto/session.dto.js';
import { LoginService } from '../services/login.service.js';
import { TokensService } from '../services/tokens.service.js';

@ApiTags('auth')
@Controller('auth')
export class LoginController {
  constructor(
    private readonly login: LoginService,
    private readonly tokens: TokensService,
  ) {}

  @Post('register')
  @ApiOperation({
    operationId: 'register',
    summary: 'Create a student account and log in',
  })
  @ApiZodBody(registerSchema)
  @ApiZodResponse(201, sessionSchema, 'Account created and logged in')
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, AUTH_ERRORS.EMAIL_TAKEN)
  register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterBody,
  ): Promise<SessionDto> {
    return this.login.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'login',
    summary: 'Log in with email and password',
  })
  @ApiZodBody(loginSchema)
  @ApiZodResponse(200, sessionSchema, 'Logged in')
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    AUTH_ERRORS.INVALID_CREDENTIALS,
    AUTH_ERRORS.ACCOUNT_SUSPENDED,
  )
  logIn(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginBody,
  ): Promise<SessionDto> {
    return this.login.login(body);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'refresh',
    summary: 'Swap a refresh token for a new pair of tokens',
  })
  @ApiZodBody(refreshSchema)
  @ApiZodResponse(
    200,
    tokenPairSchema,
    'New tokens; the old refresh token stops working',
  )
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    AUTH_ERRORS.TOKEN_INVALID,
    AUTH_ERRORS.TOKEN_EXPIRED,
    AUTH_ERRORS.TOKEN_REUSED,
    AUTH_ERRORS.ACCOUNT_SUSPENDED,
  )
  refresh(
    @Body(new ZodValidationPipe(refreshSchema)) body: RefreshBody,
  ): Promise<TokenPair> {
    return this.tokens.rotate(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'logout',
    summary: 'End this login on every device that shares it',
  })
  @ApiZodBody(refreshSchema)
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED)
  async logOut(
    @Body(new ZodValidationPipe(refreshSchema)) body: RefreshBody,
  ): Promise<void> {
    await this.tokens.revoke(body.refreshToken);
  }
}
