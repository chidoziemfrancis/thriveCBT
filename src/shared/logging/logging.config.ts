import { randomUUID } from 'node:crypto';

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Params } from 'nestjs-pino';

import type { ConfigService } from '../../config/config.service.js';

export const REQUEST_ID_HEADER = 'x-request-id';

const SENSITIVE_KEYS = [
  'password',
  'pin',
  'token',
  'accessToken',
  'refreshToken',
  'email',
  'phone',
  'name',
  'answers',
  'text',
  'note',
];

export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  ...SENSITIVE_KEYS.flatMap((key) => [key, `*.${key}`, `*.*.${key}`]),
];

const VALID_REQUEST_ID = /^[A-Za-z0-9._-]{8,64}$/;

export function requestIdFor(req: IncomingMessage, res: ServerResponse) {
  const incoming = req.headers[REQUEST_ID_HEADER];
  const id =
    typeof incoming === 'string' && VALID_REQUEST_ID.test(incoming)
      ? incoming
      : randomUUID();
  res.setHeader(REQUEST_ID_HEADER, id);
  return id;
}

function pathOnly(url: string | undefined) {
  return (url ?? '').split('?')[0];
}

export function loggingConfig(config: ConfigService): Params {
  const pretty = config.get('NODE_ENV') === 'development';
  return {
    pinoHttp: {
      level: config.get('LOG_LEVEL'),
      genReqId: requestIdFor,
      redact: { paths: REDACT_PATHS, censor: '[redacted]' },
      // Query strings can carry personal details, so only the path is logged.
      serializers: {
        req: (req: { id: string; method: string; url?: string }) => ({
          id: req.id,
          method: req.method,
          path: pathOnly(req.url),
        }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
      ...(pretty
        ? {
            transport: { target: 'pino-pretty', options: { singleLine: true } },
          }
        : {}),
    },
  };
}
