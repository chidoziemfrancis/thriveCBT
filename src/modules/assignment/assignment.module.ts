import { Module } from '@nestjs/common';

import { EmailModule } from '../../integrations/email/email.module.js';
import { UsersModule } from '../users/users.module.js';
import { AssignmentController } from './controllers/assignment.controller.js';
import { AssignmentRepository } from './repositories/assignment.repository.js';
import { AssignmentService } from './services/assignment.service.js';

@Module({
  imports: [UsersModule, EmailModule],
  controllers: [AssignmentController],
  providers: [AssignmentService, AssignmentRepository],
  exports: [AssignmentService],
})
export class AssignmentModule {}
