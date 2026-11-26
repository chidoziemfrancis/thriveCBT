import { existsSync } from 'node:fs';

export function loadEnvFile(path = '.env') {
  if (existsSync(path)) process.loadEnvFile(path);
}
