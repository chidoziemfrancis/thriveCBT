import { Injectable } from '@nestjs/common';

import type { MoodEntry } from '../../../generated/prisma/client.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { COMMON_ERRORS } from '../../../shared/errors/error-codes.js';
import { assertCanChange } from '../../../shared/sync/sync.js';
import { type SinceQuery, syncMeta } from '../../../shared/sync/sync.dto.js';
import type { MoodDto, MoodList, SaveMood } from '../dto/mood.dto.js';
import { MoodRepository } from '../repositories/mood.repository.js';

function toDto(row: MoodEntry): MoodDto {
  return {
    ...syncMeta(row),
    mood: row.mood,
    note: row.note,
    at: row.at.toISOString(),
  };
}

@Injectable()
export class MoodService {
  constructor(private readonly repository: MoodRepository) {}

  async list(
    studentId: string,
    { since }: SinceQuery,
    now = new Date(),
  ): Promise<MoodList> {
    const rows = await this.repository.changedSince(
      studentId,
      since ? new Date(since) : undefined,
    );
    return { items: rows.map(toDto), serverTime: now.toISOString() };
  }

  // Creates or updates; the phone's newest change wins.
  async save(studentId: string, id: string, body: SaveMood): Promise<MoodDto> {
    const saved = await this.repository.find(id);
    const updatedAt = new Date(body.updatedAt);
    assertCanChange(saved, studentId, updatedAt, () => saved && toDto(saved));
    return toDto(
      await this.repository.save(id, studentId, {
        mood: body.mood,
        note: body.note || null,
        at: new Date(body.at),
        updatedAt,
      }),
    );
  }

  // Deleting something the server never saw (made and removed offline) or already deleted is
  // fine: there's nothing left to do.
  async remove(studentId: string, id: string, now = new Date()): Promise<void> {
    const saved = await this.repository.find(id);
    if (!saved || saved.deletedAt) return;
    if (saved.studentId !== studentId)
      throw new AppError(COMMON_ERRORS.NOT_FOUND);
    await this.repository.markDeleted(id, now);
  }
}
