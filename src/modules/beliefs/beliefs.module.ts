import { Module } from '@nestjs/common';

import { PositiveEntriesController } from './controllers/positive-entries.controller.js';
import { PositiveEntriesRepository } from './repositories/positive-entries.repository.js';
import { PositiveEntriesService } from './services/positive-entries.service.js';

@Module({
  controllers: [PositiveEntriesController],
  providers: [PositiveEntriesService, PositiveEntriesRepository],
})
export class BeliefsModule {}
