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
  type MoodDto,
  type MoodList,
  moodListSchema,
  moodSchema,
  type SaveMood,
  saveMoodSchema,
} from '../dto/mood.dto.js';
import { MoodService } from '../services/mood.service.js';

const ACCESS = [
  STUDY_ERRORS.CONSENT_REQUIRED,
  STUDY_ERRORS.WITHDRAWN,
  COMMON_ERRORS.UNAUTHENTICATED,
  COMMON_ERRORS.FORBIDDEN,
];

@ApiTags('mood')
@ApiBearerAuth()
@Roles('student')
@StudyData()
@Controller('me/moods')
export class MoodController {
  constructor(private readonly moods: MoodService) {}

  @Get()
  @ApiOperation({
    operationId: 'listMoods',
    summary:
      'The student’s moods, or only what changed since the last pull (deletions included)',
  })
  @ApiQuery({
    name: 'since',
    required: false,
    description: '`serverTime` from the last pull',
  })
  @ApiZodResponse(
    200,
    moodListSchema,
    'Moods changed since `since`, and the server time',
  )
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, ...ACCESS)
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(sinceQuerySchema)) query: SinceQuery,
  ): Promise<MoodList> {
    return this.moods.list(user.id, query);
  }

  @Put(':id')
  @ApiOperation({
    operationId: 'saveMood',
    summary:
      'Create or update a mood; the id comes from the phone and the newest change wins',
  })
  @ApiZodBody(saveMoodSchema)
  @ApiZodResponse(200, moodSchema, 'The saved mood')
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    COMMON_ERRORS.NOT_FOUND,
    SYNC_ERRORS.STALE_UPDATE,
    ...ACCESS,
  )
  save(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(syncItemParamsSchema)) { id }: { id: string },
    @Body(new ZodValidationPipe(saveMoodSchema)) body: SaveMood,
  ): Promise<MoodDto> {
    return this.moods.save(user.id, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'deleteMood',
    summary: 'Delete a mood; a marker stays so other phones remove it too',
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
    return this.moods.remove(user.id, id);
  }
}
