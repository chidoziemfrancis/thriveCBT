import { Injectable } from '@nestjs/common';

import type { JournalEntry } from '../../../generated/prisma/client.js';
import { FieldCipher } from '../../../shared/crypto/field-cipher.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { COMMON_ERRORS } from '../../../shared/errors/error-codes.js';
import { assertCanChange } from '../../../shared/sync/sync.js';
import { type SinceQuery, syncMeta } from '../../../shared/sync/sync.dto.js';
import type {
  JournalDto,
  JournalList,
  SaveJournal,
} from '../dto/journal.dto.js';
import { JournalRepository } from '../repositories/journal.repository.js';

// The entry text is the most private thing a student writes, so it's encrypted before it's
// stored and only decrypted on its way back to that student.
@Injectable()
export class JournalService {
  constructor(
    private readonly repository: JournalRepository,
    private readonly cipher: FieldCipher,
  ) {}

  private toDto(row: JournalEntry): JournalDto {
    return {
      ...syncMeta(row),
      prompt: row.prompt,
      text: row.text ? this.cipher.decrypt(row.text) : '',
      mood: row.mood,
      sessionId: row.sessionId,
      at: row.at.toISOString(),
      editedAt: row.editedAt?.toISOString() ?? null,
    };
  }

  async list(
    studentId: string,
    { since }: SinceQuery,
    now = new Date(),
  ): Promise<JournalList> {
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
    body: SaveJournal,
  ): Promise<JournalDto> {
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
        prompt: body.prompt || null,
        text: this.cipher.encrypt(body.text),
        mood: body.mood ?? null,
        sessionId: body.sessionId ?? null,
        at: new Date(body.at),
        editedAt: body.editedAt ? new Date(body.editedAt) : null,
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
