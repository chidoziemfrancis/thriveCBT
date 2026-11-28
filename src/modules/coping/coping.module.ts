import { Module } from '@nestjs/common';

import { CrisisPlanController } from './crisis-plan/controllers/crisis-plan.controller.js';
import { CrisisPlanRepository } from './crisis-plan/repositories/crisis-plan.repository.js';
import { CrisisPlanService } from './crisis-plan/services/crisis-plan.service.js';
import { StressLogController } from './stress-log/controllers/stress-log.controller.js';
import { StressLogRepository } from './stress-log/repositories/stress-log.repository.js';
import { StressLogService } from './stress-log/services/stress-log.service.js';
import { ToolkitController } from './toolkit/controllers/toolkit.controller.js';
import { ToolkitRepository } from './toolkit/repositories/toolkit.repository.js';
import { ToolkitService } from './toolkit/services/toolkit.service.js';

@Module({
  controllers: [ToolkitController, StressLogController, CrisisPlanController],
  providers: [
    ToolkitService,
    ToolkitRepository,
    StressLogService,
    StressLogRepository,
    CrisisPlanService,
    CrisisPlanRepository,
  ],
})
export class CopingModule {}
