import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
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
} from '../../../../shared/sync/sync.dto.js';
import type { AuthUser } from '../../../../shared/types/auth-user.js';
import {
  type SaveWellPlan,
  saveWellPlanSchema,
  type WellPlanDto,
  type WellPlanList,
  wellPlanListSchema,
  wellPlanSchema,
} from '../dto/well-plan.dto.js';
import { WellPlanService } from '../services/well-plan.service.js';

const ACCESS = [
  STUDY_ERRORS.CONSENT_REQUIRED,
  STUDY_ERRORS.WITHDRAWN,
  COMMON_ERRORS.UNAUTHENTICATED,
  COMMON_ERRORS.FORBIDDEN,
];

@ApiTags('wellbeing')
@ApiBearerAuth()
@Roles('student')
@StudyData()
@Controller('me/well-plan')
export class WellPlanController {
  constructor(private readonly wellPlan: WellPlanService) {}

  @Get()
  @ApiOperation({
    operationId: 'getWellPlan',
    summary:
      'The staying-well plan as a list of at most one, or nothing if unchanged since `since`',
  })
  @ApiQuery({
    name: 'since',
    required: false,
    description: '`serverTime` from the last pull',
  })
  @ApiZodResponse(
    200,
    wellPlanListSchema,
    'The plan if it changed, and the server time',
  )
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, ...ACCESS)
  get(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(sinceQuerySchema)) query: SinceQuery,
  ): Promise<WellPlanList> {
    return this.wellPlan.list(user.id, query);
  }

  @Put()
  @ApiOperation({
    operationId: 'saveWellPlan',
    summary:
      'Replace the staying-well plan; stored encrypted, and the newest change wins',
  })
  @ApiZodBody(saveWellPlanSchema)
  @ApiZodResponse(200, wellPlanSchema, 'The saved plan')
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    SYNC_ERRORS.STALE_UPDATE,
    ...ACCESS,
  )
  save(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(saveWellPlanSchema)) body: SaveWellPlan,
  ): Promise<WellPlanDto> {
    return this.wellPlan.save(user.id, body);
  }
}
