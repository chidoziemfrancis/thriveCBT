import { Injectable } from '@nestjs/common';

import {
  type PositiveEntry,
  PositiveKind,
} from '../../../generated/prisma/client.js';
import { FieldCipher } from '../../../shared/crypto/field-cipher.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { COMMON_ERRORS } from '../../../shared/errors/error-codes.js';
import { assertCanChange } from '../../../shared/sync/sync.js';
import { type SinceQuery, syncMeta } from '../../../shared/sync/sync.dto.js';
import type {
  PositiveEntryDto,
  PositiveEntryList,
  SavePositiveEntry,
} from '../dto/positive-entry.dto.js';
import { PositiveEntriesRepository } from '../repositories/positive-entries.repository.js';

const TO_DB: Record<SavePositiveEntry['kind'], PositiveKind> = {
  strength: PositiveKind.STRENGTH,
  win: PositiveKind.WIN,
  kind: PositiveKind.KIND,
  other: PositiveKind.OTHER,
};

const FROM_DB = Object.fromEntries(
  Object.entries(TO_DB).map(([api, db]) => [db, api]),
) as Record<PositiveKind, SavePositiveEntry['kind']>;

// The student's own words about themselves are encrypted, like the journal.
@Injectable()
export class PositiveEntriesService {
  constructor(
    private readonly repository: PositiveEntriesRepository,
    private readonly cipher: FieldCipher,
  ) {}

  private toDto(row: PositiveEntry): PositiveEntryDto {
    return {
      ...syncMeta(row),
      kind: FROM_DB[row.kind],
      text: row.text ? this.cipher.decrypt(row.text) : '',
      at: row.at.toISOString(),
    };
  }

  async list(
    studentId: string,
    { since }: SinceQuery,
    now = new Date(),
  ): Promise<PositiveEntryList> {
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
    body: SavePositiveEntry,
  ): Promise<PositiveEntryDto> {
    const saved = await this.repository.find(id);
    const updatedAt = new Date(body.updatedAt);
    assertCanChange(
      saved,
      studentId,
      updatedAt,
      () => saved && this.toDto(saved),
    );
    return this.toDto(
      await this.repository.save(id, studentId, {
        kind: TO_DB[body.kind],
        text: this.cipher.encrypt(body.text),
        at: new Date(body.at),
        updatedAt,
      }),
    );
  }

  async remove(studentId: string, id: string, now = new Date()): Promise<void> {
    const saved = await this.repository.find(id);
    if (!saved || saved.deletedAt) return;
    if (saved.studentId !== studentId)
      throw new AppError(COMMON_ERRORS.NOT_FOUND);
    await this.repository.markDeleted(id, now);
  }
}
