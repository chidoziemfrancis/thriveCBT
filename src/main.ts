import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { ConfigService } from './config/config.service.js';
import { loadEnvFile } from './config/load-env-file.js';

loadEnvFile();

const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  bufferLogs: true,
  bodyParser: false,
});
configureApp(app);
await app.listen(app.get(ConfigService).get('PORT'));
