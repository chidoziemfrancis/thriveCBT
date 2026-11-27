import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/decorators/current-user.decorator.js';
import { Roles } from '../../../../shared/decorators/roles.decorator.js';
import { COMMON_ERRORS } from '../../../../shared/errors/error-codes.js';
import {
  ApiErrors,
  ApiZodResponse,
} from '../../../../shared/openapi/zod-openapi.js';
import type { AuthUser } from '../../../../shared/types/auth-user.js';
import { type OnboardingDto, onboardingSchema } from '../dto/onboarding.dto.js';
import { OnboardingService } from '../services/onboarding.service.js';

@ApiTags('me')
@ApiBearerAuth()
@Roles('student')
@Controller('me/onboarding')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Get()
  @ApiOperation({
    operationId: 'getOnboarding',
    summary: 'Where the student is in onboarding, so the app can resume',
  })
  @ApiZodResponse(
    200,
    onboardingSchema,
    'The next step and what is already done',
  )
  @ApiErrors(
    COMMON_ERRORS.UNAUTHENTICATED,
    COMMON_ERRORS.FORBIDDEN,
    COMMON_ERRORS.NOT_FOUND,
  )
  get(@CurrentUser() user: AuthUser): Promise<OnboardingDto> {
    return this.onboarding.status(user.id);
  }
}
