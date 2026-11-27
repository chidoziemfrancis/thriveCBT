import { Module } from '@nestjs/common';

import { EmailModule } from '../../integrations/email/email.module.js';
import { AlertsRepository } from './repositories/alerts.repository.js';
import { AlertsService } from './services/alerts.service.js';

@Module({
  imports: [EmailModule],
  providers: [AlertsService, AlertsRepository],
})
export class AlertsModule {}
