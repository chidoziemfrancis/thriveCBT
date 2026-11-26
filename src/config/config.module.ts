import { Global, Module } from '@nestjs/common';

import { ConfigService, ENV } from './config.service.js';
import { parseEnv } from './env.schema.js';

@Global()
@Module({
  providers: [
    { provide: ENV, useFactory: () => parseEnv(process.env) },
    ConfigService,
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
