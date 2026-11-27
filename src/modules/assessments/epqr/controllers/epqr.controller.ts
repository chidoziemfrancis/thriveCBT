import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/decorators/current-user.decorator.js';
import { Roles } from '../../../../shared/decorators/roles.decorator.js';
import { EPQR_ERRORS } from '../../../../shared/errors/codes/epqr.errors.js';
import { COMMON_ERRORS } from '../../../../shared/errors/error-codes.js';
import {
  ApiErrors,
  ApiZodBody,
  ApiZodResponse,
} from '../../../../shared/openapi/zod-openapi.js';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe.js';
import type { AuthUser } from '../../../../shared/types/auth-user.js';
import {
  type EpqrResultDto,
  epqrResultSchema,
  type SubmitEpqr,
  submitEpqrSchema,
} from '../dto/epqr.dto.js';
import { EpqrService } from '../services/epqr.service.js';

@ApiTags('assessments')
@ApiBearerAuth()
@Roles('student')
@Controller('me/epqr')
export class EpqrController {
  constructor(private readonly epqr: EpqrService) {}

  @Get()
  @ApiOperation({
    operationId: 'getEpqr',
    summary:
      'Whether the student has answered the EPQ-R; scores are never returned',
  })
  @ApiZodResponse(200, epqrResultSchema, 'The saved result')
  @ApiErrors(
    EPQR_ERRORS.NOT_TAKEN,
    COMMON_ERRORS.UNAUTHENTICATED,
    COMMON_ERRORS.FORBIDDEN,
  )
  get(@CurrentUser() user: AuthUser): Promise<EpqrResultDto> {
    return this.epqr.get(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'submitEpqr',
    summary:
      'Save the 100 EPQ-R answers; scored on the server; question 76 Yes alerts the researcher',
  })
  @ApiZodBody(submitEpqrSchema)
  @ApiZodResponse(
    200,
    epqrResultSchema,
    'The saved result; sending again returns the first one',
  )
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    COMMON_ERRORS.UNAUTHENTICATED,
    COMMON_ERRORS.FORBIDDEN,
  )
  submit(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(submitEpqrSchema)) body: SubmitEpqr,
  ): Promise<EpqrResultDto> {
    return this.epqr.submit(user.id, body);
  }
}
