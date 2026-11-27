import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { STRICT_RATE_LIMIT } from '../../../shared/constants/rate-limits.js';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator.js';
import { Roles } from '../../../shared/decorators/roles.decorator.js';
import { ASSIGNMENT_ERRORS } from '../../../shared/errors/codes/assignment.errors.js';
import { COMMON_ERRORS } from '../../../shared/errors/error-codes.js';
import {
  ApiErrors,
  ApiZodBody,
  ApiZodResponse,
} from '../../../shared/openapi/zod-openapi.js';
import { ZodValidationPipe } from '../../../shared/pipes/zod-validation.pipe.js';
import type { AuthUser } from '../../../shared/types/auth-user.js';
import {
  type AssignBody,
  assignSchema,
  type AssignmentDto,
  assignmentSchema,
  inviteCodeSchema,
  type ResearcherCard,
  researcherCardSchema,
} from '../dto/assignment.dto.js';
import { AssignmentService } from '../services/assignment.service.js';

const ACCESS = [COMMON_ERRORS.UNAUTHENTICATED, COMMON_ERRORS.FORBIDDEN];

@ApiTags('assignment')
@ApiBearerAuth()
@Roles('student')
@Controller()
export class AssignmentController {
  constructor(private readonly assignment: AssignmentService) {}

  @Get('invite-codes/:code')
  @Throttle(STRICT_RATE_LIMIT)
  @ApiOperation({
    operationId: 'previewInviteCode',
    summary: 'Who a researcher invite code belongs to',
  })
  @ApiZodResponse(200, researcherCardSchema, 'The researcher behind the code')
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    ASSIGNMENT_ERRORS.CODE_NOT_FOUND,
    COMMON_ERRORS.RATE_LIMITED,
    ...ACCESS,
  )
  preview(
    @Param('code', new ZodValidationPipe(inviteCodeSchema)) code: string,
  ): Promise<ResearcherCard> {
    return this.assignment.preview(code);
  }

  @Get('me/assignment')
  @ApiOperation({
    operationId: 'getAssignment',
    summary: 'The student’s researcher',
  })
  @ApiZodResponse(200, assignmentSchema, 'The match')
  @ApiErrors(COMMON_ERRORS.NOT_FOUND, ...ACCESS)
  get(@CurrentUser() user: AuthUser): Promise<AssignmentDto> {
    return this.assignment.get(user.id);
  }

  @Post('me/assignment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'assignResearcher',
    summary:
      'Match the student with a researcher: their invite code, or at random among researchers with space',
  })
  @ApiZodBody(assignSchema)
  @ApiZodResponse(
    200,
    assignmentSchema,
    'The match; asking again returns the same one',
  )
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    ASSIGNMENT_ERRORS.CODE_NOT_FOUND,
    ASSIGNMENT_ERRORS.NO_RESEARCHER,
    ...ACCESS,
  )
  assign(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(assignSchema)) body: AssignBody,
  ): Promise<AssignmentDto> {
    return this.assignment.assign(user.id, body.inviteCode);
  }
}
