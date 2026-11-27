import { Injectable } from '@nestjs/common';

import type { ThoughtRecord } from '../../../generated/prisma/client.js';
import { FieldCipher } from '../../../shared/crypto/field-cipher.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { COMMON_ERRORS } from '../../../shared/errors/error-codes.js';
import { assertCanChange } from '../../../shared/sync/sync.js';
import { type SinceQuery, syncMeta } from '../../../shared/sync/sync.dto.js';
import type {
  SaveThoughtRecord,
  ThoughtRecordDto,
  ThoughtRecordList,
} from '../dto/thought-record.dto.js';
import { ThoughtRecordsRepository } from '../repositories/thought-records.repository.js';

// What the student wrote in their own words is encrypted, like the journal; the chosen feelings,
// traps and ratings stay readable for the researcher's summaries.
@Injectable()
export class ThoughtRecordsService {
  constructor(
    private readonly repository: ThoughtRecordsRepository,
    private readonly cipher: FieldCipher,
  ) {}

  private open(value: string | null): string | null {
    return value ? this.cipher.decrypt(value) : null;
  }

  private seal(value: string | null | undefined): string | null {
    return value ? this.cipher.encrypt(value) : null;
  }

  private toDto(row: ThoughtRecord): ThoughtRecordDto {
    return {
      ...syncMeta(row),
      situation: this.open(row.situation) ?? '',
      thought: this.open(row.thought) ?? '',
      feeling: row.feeling,
      action: this.open(row.action),
      traps: row.traps,
      sessionId: row.sessionId,
      balanced: this.open(row.balanced),
      beliefBefore: row.beliefBefore,
      beliefAfter: row.beliefAfter,
      at: row.at.toISOString(),
    };
  }

  async list(
    studentId: string,
    { since }: SinceQuery,
    now = new Date(),
  ): Promise<ThoughtRecordList> {
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
    body: SaveThoughtRecord,
  ): Promise<ThoughtRecordDto> {
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
        situation: this.seal(body.situation),
        thought: this.seal(body.thought),
        feeling: body.feeling,
        action: this.seal(body.action),
        traps: body.traps,
        sessionId: body.sessionId ?? null,
        balanced: this.seal(body.balanced),
        beliefBefore: body.beliefBefore ?? null,
        beliefAfter: body.beliefAfter ?? null,
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
