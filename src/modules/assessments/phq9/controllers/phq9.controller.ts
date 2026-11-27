import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';

import { CurrentUser } from '../../../../shared/decorators/current-user.decorator.js';
import { StudyData } from '../../../../shared/decorators/study-data.decorator.js';
import { Roles } from '../../../../shared/decorators/roles.decorator.js';
import { PHQ9_ERRORS } from '../../../../shared/errors/codes/phq9.errors.js';
import { STUDY_ERRORS } from '../../../../shared/errors/codes/study.errors.js';
import { COMMON_ERRORS } from '../../../../shared/errors/error-codes.js';
import {
  ApiErrors,
  ApiZodBody,
  ApiZodResponse,
} from '../../../../shared/openapi/zod-openapi.js';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe.js';
import type { AuthUser } from '../../../../shared/types/auth-user.js';
import {
  type Phq9ResultDto,
  phq9ResultSchema,
  phq9ResultsSchema,
  type SubmitPhq9,
  submitPhq9Schema,
} from '../dto/phq9.dto.js';
import { Phq9Service } from '../services/phq9.service.js';

@ApiTags('assessments')
@ApiBearerAuth()
@Roles('student')
@StudyData()
@Controller('me/phq9')
export class Phq9Controller {
  constructor(private readonly phq9: Phq9Service) {}

  @Get()
  @ApiOperation({
    operationId: 'listPhq9',
    summary: 'The student’s PHQ-9 results, oldest first',
  })
  @ApiZodResponse(200, phq9ResultsSchema, 'The results')
  @ApiErrors(
    STUDY_ERRORS.CONSENT_REQUIRED,
    STUDY_ERRORS.WITHDRAWN,
    COMMON_ERRORS.UNAUTHENTICATED,
    COMMON_ERRORS.FORBIDDEN,
  )
  async list(
    @CurrentUser() user: AuthUser,
  ): Promise<z.infer<typeof phq9ResultsSchema>> {
    return { items: await this.phq9.list(user.id) };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'submitPhq9',
    summary:
      'Save the PHQ-9 (baseline or final); scored on the server; alerts the researcher when needed',
  })
  @ApiZodBody(submitPhq9Schema)
  @ApiZodResponse(
    200,
    phq9ResultSchema,
    'The scored result; sending again returns the saved one',
  )
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    PHQ9_ERRORS.BASELINE_FIRST,
    STUDY_ERRORS.CONSENT_REQUIRED,
    STUDY_ERRORS.WITHDRAWN,
    COMMON_ERRORS.UNAUTHENTICATED,
    COMMON_ERRORS.FORBIDDEN,
  )
  submit(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(submitPhq9Schema)) body: SubmitPhq9,
  ): Promise<Phq9ResultDto> {
    return this.phq9.submit(user.id, body);
  }
}
