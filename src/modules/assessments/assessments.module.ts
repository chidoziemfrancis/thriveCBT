import { Module } from '@nestjs/common';

import { SessionsModule } from '../sessions/sessions.module.js';
import { EpqrController } from './epqr/controllers/epqr.controller.js';
import { EpqrRepository } from './epqr/repositories/epqr.repository.js';
import { EpqrService } from './epqr/services/epqr.service.js';
import { Phq9Controller } from './phq9/controllers/phq9.controller.js';
import { Phq9Repository } from './phq9/repositories/phq9.repository.js';
import { Phq9Service } from './phq9/services/phq9.service.js';

@Module({
  imports: [SessionsModule],
  controllers: [Phq9Controller, EpqrController],
  providers: [Phq9Service, Phq9Repository, EpqrService, EpqrRepository],
})
export class AssessmentsModule {}
