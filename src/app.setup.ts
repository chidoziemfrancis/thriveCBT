import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { ConfigService } from './config/config.service.js';
import { setupSwagger } from './shared/openapi/swagger.js';

export const BODY_LIMIT = '1mb';

export function configureApp(app: NestExpressApplication) {
  const config = app.get(ConfigService);
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.useBodyParser('json', { limit: BODY_LIMIT });
  app.setGlobalPrefix('v1');
  app.enableCors({ origin: config.get('CORS_ORIGINS'), credentials: true });
  app.enableShutdownHooks();
  if (!config.isProduction) setupSwagger(app);
  return app;
}
