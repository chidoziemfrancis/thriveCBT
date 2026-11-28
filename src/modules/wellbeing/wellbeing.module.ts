import { Module } from '@nestjs/common';

import { EmergencyContactController } from './emergency-contact/controllers/emergency-contact.controller.js';
import { EmergencyContactRepository } from './emergency-contact/repositories/emergency-contact.repository.js';
import { EmergencyContactService } from './emergency-contact/services/emergency-contact.service.js';
import { WellPlanController } from './well-plan/controllers/well-plan.controller.js';
import { WellPlanRepository } from './well-plan/repositories/well-plan.repository.js';
import { WellPlanService } from './well-plan/services/well-plan.service.js';

@Module({
  controllers: [WellPlanController, EmergencyContactController],
  providers: [
    WellPlanService,
    WellPlanRepository,
    EmergencyContactService,
    EmergencyContactRepository,
  ],
})
export class WellbeingModule {}
