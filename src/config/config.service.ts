import { Inject, Injectable } from '@nestjs/common';

import type { Env } from './env.schema.js';

export const ENV = Symbol('ENV');

@Injectable()
export class ConfigService {
  constructor(@Inject(ENV) private readonly env: Env) {}

  get<K extends keyof Env>(key: K): Env[K] {
    return this.env[key];
  }

  get isProduction() {
    return this.env.NODE_ENV === 'production';
  }
}
