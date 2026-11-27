import { Injectable } from '@nestjs/common';

import type { Consent } from '../../../generated/prisma/client.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { COMMON_ERRORS } from '../../../shared/errors/error-codes.js';
import type { ConsentDto } from '../dto/consent.dto.js';
import { ConsentRepository } from '../repositories/consent.repository.js';

function toConsentDto(consent: Consent): ConsentDto {
  return { version: consent.version, agreedAt: consent.agreedAt.toISOString() };
}

@Injectable()
export class ConsentService {
  constructor(private readonly repository: ConsentRepository) {}

  latestFor(userId: string): Promise<Consent | null> {
    return this.repository.latest(userId);
  }

  async get(userId: string): Promise<ConsentDto> {
    const consent = await this.repository.latest(userId);
    if (!consent) throw new AppError(COMMON_ERRORS.NOT_FOUND);
    return toConsentDto(consent);
  }

  // Agreeing to the same version twice keeps the first date.
  async give(
    userId: string,
    version: string,
    now = new Date(),
  ): Promise<ConsentDto> {
    return toConsentDto(await this.repository.record(userId, version, now));
  }
}
