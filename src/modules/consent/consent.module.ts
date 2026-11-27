import { Module } from '@nestjs/common';

import { ConsentController } from './controllers/consent.controller.js';
import { ConsentRepository } from './repositories/consent.repository.js';
import { ConsentService } from './services/consent.service.js';

@Module({
  controllers: [ConsentController],
  providers: [ConsentService, ConsentRepository],
  exports: [ConsentService],
})
export class ConsentModule {}
