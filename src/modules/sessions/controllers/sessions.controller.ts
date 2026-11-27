import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../shared/decorators/current-user.decorator.js';
import { Roles } from '../../../shared/decorators/roles.decorator.js';
import { StudyData } from '../../../shared/decorators/study-data.decorator.js';
import { SESSION_ERRORS } from '../../../shared/errors/codes/session.errors.js';
import { STUDY_ERRORS } from '../../../shared/errors/codes/study.errors.js';
import { SYNC_ERRORS } from '../../../shared/errors/codes/sync.errors.js';
import { COMMON_ERRORS } from '../../../shared/errors/error-codes.js';
import {
  ApiErrors,
  ApiZodBody,
  ApiZodResponse,
} from '../../../shared/openapi/zod-openapi.js';
import { ZodValidationPipe } from '../../../shared/pipes/zod-validation.pipe.js';
import {
  type SinceQuery,
  sinceQuerySchema,
} from '../../../shared/sync/sync.dto.js';
import type { AuthUser } from '../../../shared/types/auth-user.js';
import {
  type SaveSession,
  saveSessionSchema,
  type SessionDto,
  sessionIdSchema,
  type SessionList,
  sessionListSchema,
  sessionSchema,
} from '../dto/session.dto.js';
import { SessionsService } from '../services/sessions.service.js';

const ACCESS = [
  STUDY_ERRORS.CONSENT_REQUIRED,
  STUDY_ERRORS.WITHDRAWN,
  COMMON_ERRORS.UNAUTHENTICATED,
  COMMON_ERRORS.FORBIDDEN,
];

@ApiTags('sessions')
@ApiBearerAuth()
@Roles('student')
@StudyData()
@Controller('me/sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Get()
  @ApiOperation({
    operationId: 'listSessions',
    summary:
      'The student’s session progress, or only what changed since the last pull',
  })
  @ApiQuery({
    name: 'since',
    required: false,
    description: '`serverTime` from the last pull',
  })
  @ApiZodResponse(
    200,
    sessionListSchema,
    'Progress changed since `since`, and the server time',
  )
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, ...ACCESS)
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(sinceQuerySchema)) query: SinceQuery,
  ): Promise<SessionList> {
    return this.sessions.list(user.id, query);
  }

  @Put(':sessionId')
  @ApiOperation({
    operationId: 'saveSession',
    summary: 'Save one session’s whole record; the newest change wins',
  })
  @ApiZodBody(saveSessionSchema)
  @ApiZodResponse(200, sessionSchema, 'The saved record')
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    SESSION_ERRORS.NOT_FOUND,
    SYNC_ERRORS.STALE_UPDATE,
    ...ACCESS,
  )
  save(
    @CurrentUser() user: AuthUser,
    @Param(
      'sessionId',
      new ZodValidationPipe(sessionIdSchema, SESSION_ERRORS.NOT_FOUND),
    )
    sessionId: number,
    @Body(new ZodValidationPipe(saveSessionSchema)) body: SaveSession,
  ): Promise<SessionDto> {
    return this.sessions.save(user.id, sessionId, body);
  }
}
