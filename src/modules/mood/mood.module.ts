import { Module } from '@nestjs/common';

import { MoodController } from './controllers/mood.controller.js';
import { MoodRepository } from './repositories/mood.repository.js';
import { MoodService } from './services/mood.service.js';

@Module({
  controllers: [MoodController],
  providers: [MoodService, MoodRepository],
})
export class MoodModule {}
