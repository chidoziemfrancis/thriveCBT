import { Module } from '@nestjs/common';

import { ConsentModule } from '../consent/consent.module.js';
import { MeController } from './accounts/controllers/me.controller.js';
import { AccountsRepository } from './accounts/repositories/accounts.repository.js';
import { AccountsService } from './accounts/services/accounts.service.js';
import { StudentsController } from './students/controllers/students.controller.js';
import { StudentsRepository } from './students/repositories/students.repository.js';
import { StudentsService } from './students/services/students.service.js';

@Module({
  imports: [ConsentModule],
  controllers: [MeController, StudentsController],
  providers: [
    AccountsService,
    AccountsRepository,
    StudentsService,
    StudentsRepository,
  ],
  exports: [AccountsService],
})
export class UsersModule {}
