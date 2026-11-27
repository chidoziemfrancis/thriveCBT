import { mkdirSync, writeFileSync } from 'node:fs';

import { NestFactory } from '@nestjs/core';

process.env.NODE_ENV ??= 'development';
process.env.DATABASE_URL ??= 'postgresql://docs:docs@localhost:5432/docs';
process.env.FIELD_ENCRYPTION_KEY ??= Buffer.alloc(32).toString('base64');
process.env.JWT_ACCESS_SECRET ??= 'docs-only-secret-docs-only-secret';

const { AppModule } = await import('../dist/app.module.js');
const { buildOpenApiDocument } =
  await import('../dist/shared/openapi/swagger.js');

const app = await NestFactory.create(AppModule, {
  logger: false,
  bodyParser: false,
});
app.setGlobalPrefix('v1');
await app.init();
const document = buildOpenApiDocument(app);
await app.close();

mkdirSync('docs/api', { recursive: true });
writeFileSync(
  'docs/api/openapi.json',
  `${JSON.stringify(document, null, 2)}\n`,
);
console.log(
  `docs/api/openapi.json: ${Object.keys(document.paths).length} paths`,
);
