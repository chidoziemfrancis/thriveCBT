import { Injectable } from '@nestjs/common';

import type { PlannedActivity } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

export type PlannedActivityData = Omit<
  PlannedActivity,
  'id' | 'studentId' | 'syncedAt' | 'createdAt'
>;

@Injectable()
export class PlannedActivitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(id: string): Promise<PlannedActivity | null> {
    return this.prisma.plannedActivity.findUnique({ where: { id } });
  }

  changedSince(studentId: string, since?: Date): Promise<PlannedActivity[]> {
    return this.prisma.plannedActivity.findMany({
      where: { studentId, ...(since ? { syncedAt: { gt: since } } : {}) },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });
  }

  save(
    id: string,
    studentId: string,
    data: PlannedActivityData,
  ): Promise<PlannedActivity> {
    return this.prisma.plannedActivity.upsert({
      where: { id },
      update: data,
      create: { id, studentId, ...data },
    });
  }

  markDeleted(id: string, now: Date): Promise<PlannedActivity> {
    return this.prisma.plannedActivity.update({
      where: { id },
      data: { deletedAt: now, updatedAt: now },
    });
  }
}
