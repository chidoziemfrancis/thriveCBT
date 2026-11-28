import { Injectable } from '@nestjs/common';

import type { HomeworkTick } from '../../../generated/prisma/client.js';
import { assertCanChange } from '../../../shared/sync/sync.js';
import { type SinceQuery, syncMeta } from '../../../shared/sync/sync.dto.js';
import type {
  HomeworkTickDto,
  HomeworkTickList,
  SaveHomeworkTick,
} from '../dto/homework-tick.dto.js';
import { HomeworkTicksRepository } from '../repositories/homework-ticks.repository.js';

const toDto = (row: HomeworkTick): HomeworkTickDto => ({
  ...syncMeta(row),
  sessionId: row.sessionId,
  date: row.date,
});

@Injectable()
export class HomeworkTicksService {
  constructor(private readonly repository: HomeworkTicksRepository) {}

  async list(
    studentId: string,
    { since }: SinceQuery,
    now = new Date(),
  ): Promise<HomeworkTickList> {
    const rows = await this.repository.changedSince(
      studentId,
      since ? new Date(since) : undefined,
    );
    return { items: rows.map(toDto), serverTime: now.toISOString() };
  }

  async save(
    studentId: string,
    id: string,
    body: SaveHomeworkTick,
  ): Promise<HomeworkTickDto> {
    const saved = await this.repository.find(studentId, id);
    const updatedAt = new Date(body.updatedAt);
    assertCanChange(saved, studentId, updatedAt, () => saved && toDto(saved), {
      revive: true,
    });
    return toDto(
      await this.repository.save(studentId, id, {
        sessionId: body.sessionId,
        date: body.date,
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
