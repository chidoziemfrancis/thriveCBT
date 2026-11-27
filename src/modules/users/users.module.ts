import { Module } from '@nestjs/common';

import { MeController } from './accounts/controllers/me.controller.js';
import { AccountsRepository } from './accounts/repositories/accounts.repository.js';
import { AccountsService } from './accounts/services/accounts.service.js';

@Module({
  controllers: [MeController],
  providers: [AccountsService, AccountsRepository],
  exports: [AccountsService],
})
export class UsersModule {}
