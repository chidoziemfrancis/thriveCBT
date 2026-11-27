import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { Public } from '../../../shared/decorators/public.decorator.js';

import {
  ApiErrors,
  ApiZodResponse,
} from '../../../shared/openapi/zod-openapi.js';
import {
  healthResponseSchema,
  type HealthResponse,
} from '../dto/health-response.dto.js';
import { HEALTH_ERRORS } from '../../../shared/errors/codes/health.errors.js';
import { HealthService } from '../services/health.service.js';

@ApiTags('health')
@Public()
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOperation({
    operationId: 'getHealth',
    summary: 'Check the API and database are up',
  })
  @ApiZodResponse(200, healthResponseSchema, 'The API and database are up')
  @ApiErrors(HEALTH_ERRORS.DATABASE_DOWN)
  check(): Promise<HealthResponse> {
    return this.health.check();
  }
}
