import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/decorators/current-user.decorator.js';
import { Roles } from '../../../../shared/decorators/roles.decorator.js';
import { COMMON_ERRORS } from '../../../../shared/errors/error-codes.js';
import {
  ApiErrors,
  ApiZodBody,
  ApiZodResponse,
} from '../../../../shared/openapi/zod-openapi.js';
import { ZodValidationPipe } from '../../../../shared/pipes/zod-validation.pipe.js';
import type { AuthUser } from '../../../../shared/types/auth-user.js';
import {
  type PreferencesDto,
  preferencesSchema,
  type StudentProfileDto,
  studentProfileSchema,
  type UpdatePreferencesBody,
  updatePreferencesSchema,
  type UpdateProfileBody,
  updateProfileSchema,
} from '../dto/student-profile.dto.js';
import { StudentsService } from '../services/students.service.js';

const ACCESS_ERRORS = [
  COMMON_ERRORS.UNAUTHENTICATED,
  COMMON_ERRORS.FORBIDDEN,
  COMMON_ERRORS.NOT_FOUND,
];

@ApiTags('me')
@ApiBearerAuth()
@Roles('student')
@Controller('me')
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Get('profile')
  @ApiOperation({
    operationId: 'getProfile',
    summary: 'The student’s profile and study week',
  })
  @ApiZodResponse(200, studentProfileSchema, 'The profile')
  @ApiErrors(...ACCESS_ERRORS)
  getProfile(@CurrentUser() user: AuthUser): Promise<StudentProfileDto> {
    return this.students.getProfile(user.id);
  }

  @Patch('profile')
  @ApiOperation({
    operationId: 'updateProfile',
    summary: 'Change name, date of birth, undergraduate answer or avatar',
  })
  @ApiZodBody(updateProfileSchema)
  @ApiZodResponse(200, studentProfileSchema, 'The updated profile')
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, ...ACCESS_ERRORS)
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileBody,
  ): Promise<StudentProfileDto> {
    return this.students.updateProfile(user.id, body);
  }

  @Get('preferences')
  @ApiOperation({
    operationId: 'getPreferences',
    summary: 'The student’s notification settings',
  })
  @ApiZodResponse(200, preferencesSchema, 'The settings')
  @ApiErrors(...ACCESS_ERRORS)
  getPreferences(@CurrentUser() user: AuthUser): Promise<PreferencesDto> {
    return this.students.getPreferences(user.id);
  }

  @Patch('preferences')
  @ApiOperation({
    operationId: 'updatePreferences',
    summary: 'Change notification settings',
  })
  @ApiZodBody(updatePreferencesSchema)
  @ApiZodResponse(200, preferencesSchema, 'The updated settings')
  @ApiErrors(COMMON_ERRORS.VALIDATION_FAILED, ...ACCESS_ERRORS)
  updatePreferences(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(updatePreferencesSchema))
    body: UpdatePreferencesBody,
  ): Promise<PreferencesDto> {
    return this.students.updatePreferences(user.id, body);
  }
}
