import { Module } from '@nestjs/common';

import { EmailModule } from '../../integrations/email/email.module.js';
import { UsersModule } from '../users/users.module.js';
import { WithdrawalController } from './controllers/withdrawal.controller.js';
import { WithdrawalRepository } from './repositories/withdrawal.repository.js';
import { WithdrawalService } from './services/withdrawal.service.js';

@Module({
  imports: [UsersModule, EmailModule],
  controllers: [WithdrawalController],
  providers: [WithdrawalService, WithdrawalRepository],
})
export class WithdrawalModule {}
