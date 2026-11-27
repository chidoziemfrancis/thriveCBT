import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../shared/decorators/current-user.decorator.js';
import { Roles } from '../../../shared/decorators/roles.decorator.js';
import { StudyData } from '../../../shared/decorators/study-data.decorator.js';
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
  syncItemParamsSchema,
} from '../../../shared/sync/sync.dto.js';
import type { AuthUser } from '../../../shared/types/auth-user.js';
import {
  type PlannedActivityDto,
  type PlannedActivityList,
  plannedActivityListSchema,
  plannedActivitySchema,
  type SavePlannedActivity,
  savePlannedActivitySchema,
} from '../dto/planned-activity.dto.js';
import { PlannedActivitiesService } from '../services/planned-activities.service.js';

const ACCESS = [
  STUDY_ERRORS.CONSENT_REQUIRED,
  STUDY_ERRORS.WITHDRAWN,
  COMMON_ERRORS.UNAUTHENTICATED,
  COMMON_ERRORS.FORBIDDEN,
];

@ApiTags('planned-activities')
@ApiBearerAuth()
@Roles('student')
@StudyData()
@Controller('me/planned-activities')
export class PlannedActivitiesController {
  constructor(private readonly activities: PlannedActivitiesService) {}

  @Get()
  @ApiOperation({
    operationId: 'listPlannedActivities',
    summary:
      'The student’s planned activities, or only what changed since the last pull (deletions included)',
  })
  @ApiQuery({
    name: 'since',
    required: false,
    description: '`serverTime` from the last pull',
  })
  @ApiZodResponse(
    200,
    plannedActivityListSchema,
    'Plans changed since `since`, and the server time',
  )
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, ...ACCESS)
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(sinceQuerySchema)) query: SinceQuery,
  ): Promise<PlannedActivityList> {
    return this.activities.list(user.id, query);
  }

  @Put(':id')
  @ApiOperation({
    operationId: 'savePlannedActivity',
    summary:
      'Create or update a planned activity (planned, done, rated); the id comes from the phone and the newest change wins',
  })
  @ApiZodBody(savePlannedActivitySchema)
  @ApiZodResponse(200, plannedActivitySchema, 'The saved plan')
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    COMMON_ERRORS.NOT_FOUND,
    SYNC_ERRORS.STALE_UPDATE,
    ...ACCESS,
  )
  save(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(syncItemParamsSchema)) { id }: { id: string },
    @Body(new ZodValidationPipe(savePlannedActivitySchema))
    body: SavePlannedActivity,
  ): Promise<PlannedActivityDto> {
    return this.activities.save(user.id, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'deletePlannedActivity',
    summary:
      'Delete a planned activity; a marker stays so other phones remove it too',
  })
  @ApiResponse({ status: 204, description: 'Deleted, or already gone' })
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    COMMON_ERRORS.NOT_FOUND,
    ...ACCESS,
  )
  remove(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(syncItemParamsSchema)) { id }: { id: string },
  ): Promise<void> {
    return this.activities.remove(user.id, id);
  }
}
