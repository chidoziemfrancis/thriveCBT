import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
} from '../../../../shared/sync/sync.dto.js';
import type { AuthUser } from '../../../../shared/types/auth-user.js';
import {
  type EmergencyContactDto,
  type EmergencyContactList,
  emergencyContactListSchema,
  emergencyContactSchema,
  type SaveEmergencyContact,
  saveEmergencyContactSchema,
} from '../dto/emergency-contact.dto.js';
import { EmergencyContactService } from '../services/emergency-contact.service.js';

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
@Controller('me/emergency-contact')
export class EmergencyContactController {
  constructor(private readonly contact: EmergencyContactService) {}

  @Get()
  @ApiOperation({
    operationId: 'getEmergencyContact',
    summary:
      'The emergency contact as a list of at most one, or nothing if unchanged since `since`',
  })
  @ApiQuery({
    name: 'since',
    required: false,
    description: '`serverTime` from the last pull',
  })
  @ApiZodResponse(
    200,
    emergencyContactListSchema,
    'The contact if it changed, and the server time',
  )
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, ...ACCESS)
  get(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(sinceQuerySchema)) query: SinceQuery,
  ): Promise<EmergencyContactList> {
    return this.contact.list(user.id, query);
  }

  @Put()
  @ApiOperation({
    operationId: 'saveEmergencyContact',
    summary:
      'Save the emergency contact; stored encrypted, and the newest change wins',
  })
  @ApiZodBody(saveEmergencyContactSchema)
  @ApiZodResponse(200, emergencyContactSchema, 'The saved contact')
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    SYNC_ERRORS.STALE_UPDATE,
    ...ACCESS,
  )
  save(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(saveEmergencyContactSchema))
    body: SaveEmergencyContact,
  ): Promise<EmergencyContactDto> {
    return this.contact.save(user.id, body);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'deleteEmergencyContact',
    summary:
      'Remove the emergency contact; the details are erased and a marker stays',
  })
  @ApiResponse({ status: 204, description: 'Removed, or there was none' })
  @ApiErrors(...ACCESS)
  remove(@CurrentUser() user: AuthUser): Promise<void> {
    return this.contact.remove(user.id);
  }
}
