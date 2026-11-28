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
  type SaveToolkitItem,
  saveToolkitItemSchema,
  type SaveToolUse,
  saveToolUseSchema,
  type ToolkitItemDto,
  toolkitItemSchema,
  type ToolkitList,
  toolkitListSchema,
  type ToolUseDto,
  toolUseSchema,
  type ToolUseList,
  toolUseListSchema,
} from '../dto/toolkit.dto.js';
import { ToolkitService } from '../services/toolkit.service.js';

const ACCESS = [
  STUDY_ERRORS.CONSENT_REQUIRED,
  STUDY_ERRORS.WITHDRAWN,
  COMMON_ERRORS.UNAUTHENTICATED,
  COMMON_ERRORS.FORBIDDEN,
];
const SINCE = {
  name: 'since',
  required: false,
  description: '`serverTime` from the last pull',
};
const idPipe = new ZodValidationPipe(syncItemParamsSchema);
const sincePipe = new ZodValidationPipe(sinceQuerySchema);

@ApiTags('coping')
@ApiBearerAuth()
@Roles('student')
@StudyData()
@Controller('me')
export class ToolkitController {
  constructor(private readonly toolkit: ToolkitService) {}

  @Get('toolkit')
  @ApiOperation({
    operationId: 'listToolkit',
    summary:
      'The coping cards the student keeps, or only what changed since the last pull',
  })
  @ApiQuery(SINCE)
  @ApiZodResponse(
    200,
    toolkitListSchema,
    'Cards changed since `since`, and the server time',
  )
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, ...ACCESS)
  listItems(
    @CurrentUser() user: AuthUser,
    @Query(sincePipe) query: SinceQuery,
  ): Promise<ToolkitList> {
    return this.toolkit.listItems(user.id, query);
  }

  @Put('toolkit/:id')
  @ApiOperation({
    operationId: 'saveToolkitItem',
    summary:
      'Keep a card; the phone makes the id from the card, and keeping it again brings it back',
  })
  @ApiZodBody(saveToolkitItemSchema)
  @ApiZodResponse(200, toolkitItemSchema, 'The saved card')
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    SYNC_ERRORS.STALE_UPDATE,
    ...ACCESS,
  )
  saveItem(
    @CurrentUser() user: AuthUser,
    @Param(idPipe) { id }: { id: string },
    @Body(new ZodValidationPipe(saveToolkitItemSchema)) body: SaveToolkitItem,
  ): Promise<ToolkitItemDto> {
    return this.toolkit.saveItem(user.id, id, body);
  }

  @Delete('toolkit/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'deleteToolkitItem',
    summary: 'Take a card out of the toolkit',
  })
  @ApiResponse({ status: 204, description: 'Removed, or already gone' })
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, ...ACCESS)
  removeItem(
    @CurrentUser() user: AuthUser,
    @Param(idPipe) { id }: { id: string },
  ): Promise<void> {
    return this.toolkit.removeItem(user.id, id);
  }

  @Get('tool-uses')
  @ApiOperation({
    operationId: 'listToolUses',
    summary: 'Each time the student used a card and how much it helped',
  })
  @ApiQuery(SINCE)
  @ApiZodResponse(
    200,
    toolUseListSchema,
    'Uses changed since `since`, and the server time',
  )
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, ...ACCESS)
  listUses(
    @CurrentUser() user: AuthUser,
    @Query(sincePipe) query: SinceQuery,
  ): Promise<ToolUseList> {
    return this.toolkit.listUses(user.id, query);
  }

  @Put('tool-uses/:id')
  @ApiOperation({
    operationId: 'saveToolUse',
    summary: 'Record a use of a card; the id comes from the phone',
  })
  @ApiZodBody(saveToolUseSchema)
  @ApiZodResponse(200, toolUseSchema, 'The saved use')
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    SYNC_ERRORS.STALE_UPDATE,
    ...ACCESS,
  )
  saveUse(
    @CurrentUser() user: AuthUser,
    @Param(idPipe) { id }: { id: string },
    @Body(new ZodValidationPipe(saveToolUseSchema)) body: SaveToolUse,
  ): Promise<ToolUseDto> {
    return this.toolkit.saveUse(user.id, id, body);
  }

  @Delete('tool-uses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'deleteToolUse',
    summary: 'Delete a recorded use',
  })
  @ApiResponse({ status: 204, description: 'Deleted, or already gone' })
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, ...ACCESS)
  removeUse(
    @CurrentUser() user: AuthUser,
    @Param(idPipe) { id }: { id: string },
  ): Promise<void> {
    return this.toolkit.removeUse(user.id, id);
  }
}
