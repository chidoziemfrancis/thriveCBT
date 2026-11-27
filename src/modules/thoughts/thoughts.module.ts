import { Module } from '@nestjs/common';

import { ThoughtRecordsController } from './controllers/thought-records.controller.js';
import { ThoughtRecordsRepository } from './repositories/thought-records.repository.js';
import { ThoughtRecordsService } from './services/thought-records.service.js';

@Module({
  controllers: [ThoughtRecordsController],
  providers: [ThoughtRecordsService, ThoughtRecordsRepository],
})
export class ThoughtsModule {}
