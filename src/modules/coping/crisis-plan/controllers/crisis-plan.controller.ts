import { Body, Controller, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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
import type { AuthUser } from '../../../../shared/types/auth-user.js';
import {
  type CrisisPlanProgressDto,
  crisisPlanProgressSchema,
  type SaveCrisisPlanProgress,
  saveCrisisPlanProgressSchema,
} from '../dto/crisis-plan-progress.dto.js';
import { CrisisPlanService } from '../services/crisis-plan.service.js';

@ApiTags('coping')
@ApiBearerAuth()
@Roles('student')
@StudyData()
@Controller('me/crisis-plan-progress')
export class CrisisPlanController {
  constructor(private readonly crisisPlan: CrisisPlanService) {}

  @Put()
  @ApiOperation({
    operationId: 'saveCrisisPlanProgress',
    summary:
      'How many of the crisis plan’s six parts are filled in; the plan stays on the phone',
  })
  @ApiZodBody(saveCrisisPlanProgressSchema)
  @ApiZodResponse(200, crisisPlanProgressSchema, 'The saved count')
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    SYNC_ERRORS.STALE_UPDATE,
    STUDY_ERRORS.CONSENT_REQUIRED,
    STUDY_ERRORS.WITHDRAWN,
    COMMON_ERRORS.UNAUTHENTICATED,
    COMMON_ERRORS.FORBIDDEN,
  )
  save(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(saveCrisisPlanProgressSchema))
    body: SaveCrisisPlanProgress,
  ): Promise<CrisisPlanProgressDto> {
    return this.crisisPlan.save(user.id, body);
  }
}
