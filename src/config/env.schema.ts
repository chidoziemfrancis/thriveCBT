import { z } from 'zod';

const KEY_BYTES = 32;

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
    CORS_ORIGINS: z
      .string()
      .default('')
      .transform((value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    JWT_ACCESS_SECRET: z.string().min(32, 'must be at least 32 characters'),
    FIELD_ENCRYPTION_KEY: z
      .string()
      .refine(
        (value) => Buffer.from(value, 'base64').length === KEY_BYTES,
        `must be ${KEY_BYTES} bytes, base64 encoded`,
      ),
    EMAIL_TRANSPORT: z.enum(['log', 'unosend']).default('log'),
    EMAIL_FROM: z.string().default('ThriveCBT <no-reply@thrivecbt.app>'),
    UNOSEND_API_KEY: z.string().optional(),
    UNOSEND_API_URL: z.url().default('https://api.unosend.co/v1'),
  })
  .refine(
    (env) => env.EMAIL_TRANSPORT !== 'unosend' || Boolean(env.UNOSEND_API_KEY),
    {
      path: ['UNOSEND_API_KEY'],
      message: 'is required when EMAIL_TRANSPORT is "unosend"',
    },
  )
  .refine(
    (env) => !(env.NODE_ENV === 'production' && env.EMAIL_TRANSPORT === 'log'),
    {
      path: ['EMAIL_TRANSPORT'],
      message: 'production needs a real email provider, not "log"',
    },
  );

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (result.success) return result.data;
  const problems = result.error.issues
    .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid settings in the environment:\n${problems}`);
}
