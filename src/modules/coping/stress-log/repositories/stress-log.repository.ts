import { Injectable } from '@nestjs/common';

import type { StressEntry } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class StressLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(studentId: string, id: string): Promise<StressEntry | null> {
    return this.prisma.stressEntry.findUnique({
      where: { studentId_id: { studentId, id } },
    });
  }

  changedSince(studentId: string, after?: Date): Promise<StressEntry[]> {
    return this.prisma.stressEntry.findMany({
      where: { studentId, ...(after ? { syncedAt: { gt: after } } : {}) },
      orderBy: { at: 'asc' },
    });
  }

  /** `situation` and `helped` must already be encrypted. */
  save(
    studentId: string,
    id: string,
    data: {
      situation: string;
      level: number | null;
      helped: string | null;
      at: Date;
      updatedAt: Date;
    },
  ): Promise<StressEntry> {
    return this.prisma.stressEntry.upsert({
      where: { studentId_id: { studentId, id } },
      update: data,
      create: { studentId, id, ...data },
    });
  }

  markDeleted(studentId: string, id: string, now: Date): Promise<StressEntry> {
    return this.prisma.stressEntry.update({
      where: { studentId_id: { studentId, id } },
      data: {
        deletedAt: now,
        updatedAt: now,
        situation: null,
        helped: null,
        level: null,
      },
    });
  }
}
