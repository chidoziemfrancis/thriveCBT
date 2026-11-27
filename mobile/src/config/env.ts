import { z } from 'zod';

const DEV_API_URL = 'http://localhost:3000/v1';

const envSchema = z.object({ apiUrl: z.url() });

export type Env = z.infer<typeof envSchema>;

// Expo only inlines EXPO_PUBLIC_ values read as `process.env.NAME`, so the default reads it that way.
export function readEnv(
  source: { apiUrl?: string } = { apiUrl: process.env.EXPO_PUBLIC_API_URL },
  isDev: boolean = __DEV__
): Env {
  const parsed = envSchema.safeParse({
    apiUrl: source.apiUrl || (isDev ? DEV_API_URL : undefined),
  });
  if (!parsed.success) throw new Error('EXPO_PUBLIC_API_URL is missing or is not a URL');
  if (!isDev && !parsed.data.apiUrl.startsWith('https://')) {
    throw new Error('EXPO_PUBLIC_API_URL must use https outside development');
  }
  return parsed.data;
}

export const env = readEnv();
