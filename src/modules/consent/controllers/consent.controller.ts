import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../shared/decorators/current-user.decorator.js';
import { Roles } from '../../../shared/decorators/roles.decorator.js';
import { COMMON_ERRORS } from '../../../shared/errors/error-codes.js';
import {
  ApiErrors,
  ApiZodBody,
  ApiZodResponse,
} from '../../../shared/openapi/zod-openapi.js';
import { ZodValidationPipe } from '../../../shared/pipes/zod-validation.pipe.js';
import type { AuthUser } from '../../../shared/types/auth-user.js';
import {
  type ConsentDto,
  consentSchema,
  type GiveConsentBody,
  giveConsentSchema,
} from '../dto/consent.dto.js';
import { ConsentService } from '../services/consent.service.js';

@ApiTags('me')
@ApiBearerAuth()
@Roles('student')
@Controller('me/consent')
export class ConsentController {
  constructor(private readonly consent: ConsentService) {}

  @Get()
  @ApiOperation({
    operationId: 'getConsent',
    summary: 'The consent the student last agreed to',
  })
  @ApiZodResponse(200, consentSchema, 'The latest consent')
  @ApiErrors(
    COMMON_ERRORS.UNAUTHENTICATED,
    COMMON_ERRORS.FORBIDDEN,
    COMMON_ERRORS.NOT_FOUND,
  )
  get(@CurrentUser() user: AuthUser): Promise<ConsentDto> {
    return this.consent.get(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'giveConsent',
    summary: 'Record that the student agreed to this consent version',
  })
  @ApiZodBody(giveConsentSchema)
  @ApiZodResponse(200, consentSchema, 'Consent recorded')
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    COMMON_ERRORS.UNAUTHENTICATED,
    COMMON_ERRORS.FORBIDDEN,
  )
  give(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(giveConsentSchema)) body: GiveConsentBody,
  ): Promise<ConsentDto> {
    return this.consent.give(user.id, body.version);
  }
}
