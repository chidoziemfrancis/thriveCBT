import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../../shared/decorators/current-user.decorator.js';
import { COMMON_ERRORS } from '../../../../shared/errors/error-codes.js';
import {
  ApiErrors,
  ApiZodResponse,
} from '../../../../shared/openapi/zod-openapi.js';
import type { AuthUser } from '../../../../shared/types/auth-user.js';
import { toUserDto, userSchema, type UserDto } from '../dto/user.dto.js';
import { AccountsService } from '../services/accounts.service.js';

@ApiTags('me')
@ApiBearerAuth()
@Controller('me')
export class MeController {
  constructor(private readonly accounts: AccountsService) {}

  @Get()
  @ApiOperation({ operationId: 'getMe', summary: 'The logged-in account' })
  @ApiZodResponse(200, userSchema, 'The account')
  @ApiErrors(COMMON_ERRORS.UNAUTHENTICATED, COMMON_ERRORS.NOT_FOUND)
  async me(@CurrentUser() user: AuthUser): Promise<UserDto> {
    return toUserDto(await this.accounts.getById(user.id));
  }
}
