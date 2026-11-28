import { Module } from '@nestjs/common';

import { HomeworkTicksController } from './controllers/homework-ticks.controller.js';
import { HomeworkTicksRepository } from './repositories/homework-ticks.repository.js';
import { HomeworkTicksService } from './services/homework-ticks.service.js';

@Module({
  controllers: [HomeworkTicksController],
  providers: [HomeworkTicksService, HomeworkTicksRepository],
})
export class HomeworkModule {}
