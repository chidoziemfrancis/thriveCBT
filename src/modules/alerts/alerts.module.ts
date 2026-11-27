import { Module } from '@nestjs/common';

import { EmailModule } from '../../integrations/email/email.module.js';
import { UsersModule } from '../users/users.module.js';
import { AlertsRepository } from './repositories/alerts.repository.js';
import { AlertsService } from './services/alerts.service.js';

@Module({
  imports: [EmailModule, UsersModule],
  providers: [AlertsService, AlertsRepository],
})
export class AlertsModule {}
