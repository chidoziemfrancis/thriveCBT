import { Injectable } from '@nestjs/common';

import type { StressEntry } from '../../../../generated/prisma/client.js';
import { FieldCipher } from '../../../../shared/crypto/field-cipher.js';
import { assertCanChange } from '../../../../shared/sync/sync.js';
import { type SinceQuery, syncMeta } from '../../../../shared/sync/sync.dto.js';
import type {
  SaveStressEntry,
  StressEntryDto,
  StressEntryList,
} from '../dto/stress-entry.dto.js';
import { StressLogRepository } from '../repositories/stress-log.repository.js';

// What happened and what helped are the student's own words, so they're encrypted like the
// journal; the stress level stays readable for the researcher.
@Injectable()
export class StressLogService {
  constructor(
    private readonly repository: StressLogRepository,
    private readonly cipher: FieldCipher,
  ) {}

  private toDto(row: StressEntry): StressEntryDto {
    return {
      ...syncMeta(row),
      situation: row.situation ? this.cipher.decrypt(row.situation) : '',
      level: row.level,
      helped: row.helped ? this.cipher.decrypt(row.helped) : null,
      at: row.at.toISOString(),
    };
  }

  async list(
    studentId: string,
    { since }: SinceQuery,
    now = new Date(),
  ): Promise<StressEntryList> {
    const rows = await this.repository.changedSince(
      studentId,
      since ? new Date(since) : undefined,
    );
    return {
      items: rows.map((row) => this.toDto(row)),
      serverTime: now.toISOString(),
    };
  }

  async save(
    studentId: string,
    id: string,
    body: SaveStressEntry,
  ): Promise<StressEntryDto> {
    const saved = await this.repository.find(studentId, id);
    const updatedAt = new Date(body.updatedAt);
    assertCanChange(
      saved,
      studentId,
      updatedAt,
      () => saved && this.toDto(saved),
    );
    return this.toDto(
      await this.repository.save(studentId, id, {
        situation: this.cipher.encrypt(body.situation),
        level: body.level ?? null,
        helped: body.helped ? this.cipher.encrypt(body.helped) : null,
        at: new Date(body.at),
        updatedAt,
      }),
    );
  }

  async remove(studentId: string, id: string, now = new Date()): Promise<void> {
    const saved = await this.repository.find(studentId, id);
    if (saved && !saved.deletedAt)
      await this.repository.markDeleted(studentId, id, now);
  }
}
