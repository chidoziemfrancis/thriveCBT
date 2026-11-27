import { Module } from '@nestjs/common';

import { PlannedActivitiesController } from './controllers/planned-activities.controller.js';
import { PlannedActivitiesRepository } from './repositories/planned-activities.repository.js';
import { PlannedActivitiesService } from './services/planned-activities.service.js';

@Module({
  controllers: [PlannedActivitiesController],
  providers: [PlannedActivitiesService, PlannedActivitiesRepository],
})
export class ActivitiesModule {}
