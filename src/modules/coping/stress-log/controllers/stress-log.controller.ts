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

import { CurrentUser } from '../../../../shared/decorators/current-user.decorator.js';
import { Roles } from '../../../../shared/decorators/roles.decorator.js';
import { StudyData } from '../../../../shared/decorators/study-data.decorator.js';
import { STUDY_ERRORS } from '../../../../shared/errors/codes/study.errors.js';
import { SYNC_ERRORS } from '../../../../shared/errors/codes/sync.errors.js';
import { COMMON_ERRORS } from '../../../../shared/errors/error-codes.js';
import {
  ApiErrors,
  ApiZodBody,
  ApiZodResponse,
} from '../../../../shared/openapi/zod-openapi.js';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe.js';
import {
  type SinceQuery,
  sinceQuerySchema,
  syncItemParamsSchema,
} from '../../../../shared/sync/sync.dto.js';
import type { AuthUser } from '../../../../shared/types/auth-user.js';
import {
  type StressEntryDto,
  type StressEntryList,
  stressEntryListSchema,
  stressEntrySchema,
  type SaveStressEntry,
  saveStressEntrySchema,
} from '../dto/stress-entry.dto.js';
import { StressLogService } from '../services/stress-log.service.js';

const ACCESS = [
  STUDY_ERRORS.CONSENT_REQUIRED,
  STUDY_ERRORS.WITHDRAWN,
  COMMON_ERRORS.UNAUTHENTICATED,
  COMMON_ERRORS.FORBIDDEN,
];

@ApiTags('coping')
@ApiBearerAuth()
@Roles('student')
@StudyData()
@Controller('me/stress-entries')
export class StressLogController {
  constructor(private readonly log: StressLogService) {}

  @Get()
  @ApiOperation({
    operationId: 'listStressEntries',
    summary:
      'The student’s stress log, or only what changed since the last pull (deletions included)',
  })
  @ApiQuery({
    name: 'since',
    required: false,
    description: '`serverTime` from the last pull',
  })
  @ApiZodResponse(
    200,
    stressEntryListSchema,
    'Entries changed since `since`, and the server time',
  )
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, ...ACCESS)
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(sinceQuerySchema)) query: SinceQuery,
  ): Promise<StressEntryList> {
    return this.log.list(user.id, query);
  }

  @Put(':id')
  @ApiOperation({
    operationId: 'saveStressEntry',
    summary:
      'Create or update a stress entry; their own words are encrypted; the id comes from the phone and the newest change wins',
  })
  @ApiZodBody(saveStressEntrySchema)
  @ApiZodResponse(200, stressEntrySchema, 'The saved entry')
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    COMMON_ERRORS.NOT_FOUND,
    SYNC_ERRORS.STALE_UPDATE,
    ...ACCESS,
  )
  save(
    @CurrentUser() user: AuthUser,
    @Param(new ZodValidationPipe(syncItemParamsSchema)) { id }: { id: string },
    @Body(new ZodValidationPipe(saveStressEntrySchema)) body: SaveStressEntry,
  ): Promise<StressEntryDto> {
    return this.log.save(user.id, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'deleteStressEntry',
    summary:
      'Delete a stress entry; its writing is erased and a marker stays so other phones remove it too',
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
    return this.log.remove(user.id, id);
  }
}
