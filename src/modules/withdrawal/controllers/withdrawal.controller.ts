import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../shared/decorators/current-user.decorator.js';
import { Roles } from '../../../shared/decorators/roles.decorator.js';
import { WITHDRAWAL_ERRORS } from '../../../shared/errors/codes/withdrawal.errors.js';
import { COMMON_ERRORS } from '../../../shared/errors/error-codes.js';
import {
  ApiErrors,
  ApiZodBody,
  ApiZodResponse,
} from '../../../shared/openapi/zod-openapi.js';
import { ZodValidationPipe } from '../../../shared/pipes/zod-validation.pipe.js';
import type { AuthUser } from '../../../shared/types/auth-user.js';
import {
  type WithdrawalDto,
  withdrawalSchema,
  type WithdrawBody,
  withdrawSchema,
} from '../dto/withdrawal.dto.js';
import { WithdrawalService } from '../services/withdrawal.service.js';

@ApiTags('study')
@ApiBearerAuth()
@Roles('student')
@Controller('me/withdraw')
export class WithdrawalController {
  constructor(private readonly withdrawal: WithdrawalService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'withdraw',
    summary:
      'Leave the study: closes the account, signs out everywhere and tells the researcher',
  })
  @ApiZodBody(withdrawSchema)
  @ApiZodResponse(
    200,
    withdrawalSchema,
    'When the student withdrew; sending again returns the first date',
  )
  @ApiErrors(
    COMMON_ERRORS.VALIDATION_FAILED,
    WITHDRAWAL_ERRORS.CONFIRM_MISMATCH,
    COMMON_ERRORS.UNAUTHENTICATED,
    COMMON_ERRORS.FORBIDDEN,
  )
  withdraw(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(withdrawSchema)) body: WithdrawBody,
  ): Promise<WithdrawalDto> {
    return this.withdrawal.withdraw(user.id, body);
  }
}
