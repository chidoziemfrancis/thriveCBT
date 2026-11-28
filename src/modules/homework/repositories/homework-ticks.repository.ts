import { Injectable } from '@nestjs/common';

import type { HomeworkTick } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class HomeworkTicksRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(studentId: string, id: string): Promise<HomeworkTick | null> {
    return this.prisma.homeworkTick.findUnique({
      where: { studentId_id: { studentId, id } },
    });
  }

  changedSince(studentId: string, after?: Date): Promise<HomeworkTick[]> {
    return this.prisma.homeworkTick.findMany({
      where: { studentId, ...(after ? { syncedAt: { gt: after } } : {}) },
      orderBy: [{ sessionId: 'asc' }, { date: 'asc' }],
    });
  }

  save(
    studentId: string,
    id: string,
    data: { sessionId: number; date: string; updatedAt: Date },
  ): Promise<HomeworkTick> {
    return this.prisma.homeworkTick.upsert({
      where: { studentId_id: { studentId, id } },
      update: { ...data, deletedAt: null },
      create: { studentId, id, ...data },
    });
  }

  markDeleted(studentId: string, id: string, now: Date): Promise<HomeworkTick> {
    return this.prisma.homeworkTick.update({
      where: { studentId_id: { studentId, id } },
      data: { deletedAt: now, updatedAt: now },
    });
  }
}
