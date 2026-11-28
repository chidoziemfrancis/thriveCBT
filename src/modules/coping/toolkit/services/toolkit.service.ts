import { Injectable } from '@nestjs/common';

import type {
  ToolkitItem,
  ToolUse,
} from '../../../../generated/prisma/client.js';
import { assertCanChange } from '../../../../shared/sync/sync.js';
import { type SinceQuery, syncMeta } from '../../../../shared/sync/sync.dto.js';
import type {
  SaveToolkitItem,
  SaveToolUse,
  ToolkitItemDto,
  ToolkitList,
  ToolUseDto,
  ToolUseList,
} from '../dto/toolkit.dto.js';
import { ToolkitRepository } from '../repositories/toolkit.repository.js';

const toItemDto = (row: ToolkitItem): ToolkitItemDto => ({
  ...syncMeta(row),
  cardId: row.cardId,
});

const toUseDto = (row: ToolUse): ToolUseDto => ({
  ...syncMeta(row),
  cardId: row.cardId,
  helped: row.helped,
  at: row.at.toISOString(),
});

const sinceDate = ({ since }: SinceQuery) =>
  since ? new Date(since) : undefined;

// Ids are only unique within one student; the phone makes a toolkit item's id from its card.
@Injectable()
export class ToolkitService {
  constructor(private readonly repository: ToolkitRepository) {}

  async listItems(
    studentId: string,
    query: SinceQuery,
    now = new Date(),
  ): Promise<ToolkitList> {
    const rows = await this.repository.itemsChangedSince(
      studentId,
      sinceDate(query),
    );
    return { items: rows.map(toItemDto), serverTime: now.toISOString() };
  }

  // Keeping a card again after removing it brings it back.
  async saveItem(
    studentId: string,
    id: string,
    body: SaveToolkitItem,
  ): Promise<ToolkitItemDto> {
    const saved = await this.repository.findItem(studentId, id);
    const updatedAt = new Date(body.updatedAt);
    assertCanChange(
      saved,
      studentId,
      updatedAt,
      () => saved && toItemDto(saved),
      { revive: true },
    );
    return toItemDto(
      await this.repository.saveItem(studentId, id, {
        cardId: body.cardId,
        updatedAt,
      }),
    );
  }

  async removeItem(
    studentId: string,
    id: string,
    now = new Date(),
  ): Promise<void> {
    const saved = await this.repository.findItem(studentId, id);
    if (saved && !saved.deletedAt)
      await this.repository.deleteItem(studentId, id, now);
  }

  async listUses(
    studentId: string,
    query: SinceQuery,
    now = new Date(),
  ): Promise<ToolUseList> {
    const rows = await this.repository.usesChangedSince(
      studentId,
      sinceDate(query),
    );
    return { items: rows.map(toUseDto), serverTime: now.toISOString() };
  }

  async saveUse(
    studentId: string,
    id: string,
    body: SaveToolUse,
  ): Promise<ToolUseDto> {
    const saved = await this.repository.findUse(studentId, id);
    const updatedAt = new Date(body.updatedAt);
    assertCanChange(
      saved,
      studentId,
      updatedAt,
      () => saved && toUseDto(saved),
    );
    return toUseDto(
      await this.repository.saveUse(studentId, id, {
        cardId: body.cardId,
        helped: body.helped,
        at: new Date(body.at),
        updatedAt,
      }),
    );
  }

  async removeUse(
    studentId: string,
    id: string,
    now = new Date(),
  ): Promise<void> {
    const saved = await this.repository.findUse(studentId, id);
    if (saved && !saved.deletedAt)
      await this.repository.deleteUse(studentId, id, now);
  }
}
