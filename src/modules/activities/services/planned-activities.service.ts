import { Injectable } from '@nestjs/common';

import {
  ActivitySlot,
  type PlannedActivity,
} from '../../../generated/prisma/client.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { COMMON_ERRORS } from '../../../shared/errors/error-codes.js';
import { assertCanChange } from '../../../shared/sync/sync.js';
import { type SinceQuery, syncMeta } from '../../../shared/sync/sync.dto.js';
import type {
  PlannedActivityDto,
  PlannedActivityList,
  SavePlannedActivity,
} from '../dto/planned-activity.dto.js';
import { PlannedActivitiesRepository } from '../repositories/planned-activities.repository.js';

const TO_DB: Record<SavePlannedActivity['slot'], ActivitySlot> = {
  morning: ActivitySlot.MORNING,
  afternoon: ActivitySlot.AFTERNOON,
  evening: ActivitySlot.EVENING,
};

const FROM_DB = Object.fromEntries(
  Object.entries(TO_DB).map(([api, db]) => [db, api]),
) as Record<ActivitySlot, SavePlannedActivity['slot']>;

function toDto(row: PlannedActivity): PlannedActivityDto {
  return {
    ...syncMeta(row),
    date: row.date,
    slot: FROM_DB[row.slot],
    label: row.label,
    predicted: row.predicted,
    sessionId: row.sessionId,
    doneAt: row.doneAt?.toISOString() ?? null,
    enjoy: row.enjoy,
    achieve: row.achieve,
  };
}

// A plan is made first and filled in later (done, then rated), so the phone sends the whole
// plan each time and the newest change wins.
@Injectable()
export class PlannedActivitiesService {
  constructor(private readonly repository: PlannedActivitiesRepository) {}

  async list(
    studentId: string,
    { since }: SinceQuery,
    now = new Date(),
  ): Promise<PlannedActivityList> {
    const rows = await this.repository.changedSince(
      studentId,
      since ? new Date(since) : undefined,
    );
    return { items: rows.map(toDto), serverTime: now.toISOString() };
  }

  async save(
    studentId: string,
    id: string,
    body: SavePlannedActivity,
  ): Promise<PlannedActivityDto> {
    const saved = await this.repository.find(id);
    const updatedAt = new Date(body.updatedAt);
    // The phone makes a plan's id from its day, slot and activity, so planning the same thing
    // again after removing it brings the old plan back rather than being refused.
    assertCanChange(saved, studentId, updatedAt, () => saved && toDto(saved), {
      revive: true,
    });
    return toDto(
      await this.repository.save(id, studentId, {
        date: body.date,
        slot: TO_DB[body.slot],
        label: body.label,
        predicted: body.predicted ?? null,
        sessionId: body.sessionId ?? null,
        doneAt: body.doneAt ? new Date(body.doneAt) : null,
        enjoy: body.enjoy ?? null,
        achieve: body.achieve ?? null,
        updatedAt,
        deletedAt: null,
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
