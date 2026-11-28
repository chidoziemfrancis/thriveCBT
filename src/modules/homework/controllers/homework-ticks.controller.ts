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
  type HomeworkTickDto,
  type HomeworkTickList,
  homeworkTickListSchema,
  homeworkTickSchema,
  type SaveHomeworkTick,
  saveHomeworkTickSchema,
} from '../dto/homework-tick.dto.js';
import { HomeworkTicksService } from '../services/homework-ticks.service.js';

const ACCESS = [
  STUDY_ERRORS.CONSENT_REQUIRED,
  STUDY_ERRORS.WITHDRAWN,
  COMMON_ERRORS.UNAUTHENTICATED,
  COMMON_ERRORS.FORBIDDEN,
];

@ApiTags('homework')
@ApiBearerAuth()
@Roles('student')
@StudyData()
@Controller('me/homework-ticks')
export class HomeworkTicksController {
  constructor(private readonly ticks: HomeworkTicksService) {}

  @Get()
  @ApiOperation({
    operationId: 'listHomeworkTicks',
    summary:
      'The days the student ticked off their practice, or only what changed since the last pull (deletions included)',
  })
  @ApiQuery({
    name: 'since',
    required: false,
    description: '`serverTime` from the last pull',
  })
  @ApiZodResponse(
    200,
    homeworkTickListSchema,
    'Ticks changed since `since`, and the server time',
  )
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, ...ACCESS)
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(sinceQuerySchema)) query: SinceQuery,
  ): Promise<HomeworkTickList> {
    return this.ticks.list(user.id, query);
  }

  @Put(':id')
  @ApiOperation({
    operationId: 'saveHomeworkTick',
    summary:
      'Tick off a day’s practice; the phone makes the id from the session and date',
  })
  @ApiZodBody(saveHomeworkTickSchema)
  @ApiZodResponse(200, homeworkTickSchema, 'The saved tick')
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    SYNC_ERRORS.STALE_UPDATE,
    ...ACCESS,
  )
  save(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(syncItemParamsSchema)) { id }: { id: string },
    @Body(new ZodValidationPipe(saveHomeworkTickSchema)) body: SaveHomeworkTick,
  ): Promise<HomeworkTickDto> {
    return this.ticks.save(user.id, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'deleteHomeworkTick',
    summary: 'Untick a day; a marker stays so other phones untick it too',
  })
  @ApiResponse({ status: 204, description: 'Deleted, or already gone' })
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, ...ACCESS)
  remove(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(syncItemParamsSchema)) { id }: { id: string },
  ): Promise<void> {
    return this.ticks.remove(user.id, id);
  }
}
