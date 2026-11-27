import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module.js';
import { LoginController } from './login/controllers/login.controller.js';
import { RefreshTokensRepository } from './login/repositories/refresh-tokens.repository.js';
import { LoginService } from './login/services/login.service.js';
import { TokensService } from './login/services/tokens.service.js';

@Module({
  imports: [UsersModule],
  controllers: [LoginController],
  providers: [LoginService, TokensService, RefreshTokensRepository],
  exports: [TokensService],
})
export class AuthModule {}
