import { Module } from '@nestjs/common';

import { Phq9Controller } from './phq9/controllers/phq9.controller.js';
import { Phq9Repository } from './phq9/repositories/phq9.repository.js';
import { Phq9Service } from './phq9/services/phq9.service.js';

@Module({
  controllers: [Phq9Controller],
  providers: [Phq9Service, Phq9Repository],
})
export class AssessmentsModule {}
