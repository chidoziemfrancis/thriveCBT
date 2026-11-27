import { Module } from '@nestjs/common';

import { JournalController } from './controllers/journal.controller.js';
import { JournalRepository } from './repositories/journal.repository.js';
import { JournalService } from './services/journal.service.js';

@Module({
  controllers: [JournalController],
  providers: [JournalService, JournalRepository],
})
export class JournalModule {}
