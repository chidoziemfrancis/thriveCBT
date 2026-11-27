import { Injectable } from '@nestjs/common';

import { AppError } from '../../../shared/errors/app-error.js';
import type { HealthResponse } from '../dto/health-response.dto.js';
import { HEALTH_ERRORS } from '../../../shared/errors/codes/health.errors.js';
import { HealthRepository } from '../repositories/health.repository.js';

const PING_TIMEOUT_MS = 2000;

@Injectable()
export class HealthService {
  constructor(private readonly repository: HealthRepository) {}

  async check(): Promise<HealthResponse> {
    try {
      await Promise.race([
        this.repository.ping(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Database ping timed out')),
            PING_TIMEOUT_MS,
          ).unref(),
        ),
      ]);
    } catch (cause) {
      throw new AppError(HEALTH_ERRORS.DATABASE_DOWN, { cause });
    }
    return { status: 'ok', database: 'ok' };
  }
}
