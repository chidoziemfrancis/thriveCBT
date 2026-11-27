import { Injectable } from '@nestjs/common';

import type { ThoughtRecord } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

/** Situation, thought, action and balanced must already be encrypted. */
export type ThoughtRecordData = Omit<
  ThoughtRecord,
  'id' | 'studentId' | 'deletedAt' | 'syncedAt' | 'createdAt'
>;

@Injectable()
export class ThoughtRecordsRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(id: string): Promise<ThoughtRecord | null> {
    return this.prisma.thoughtRecord.findUnique({ where: { id } });
  }

  changedSince(studentId: string, since?: Date): Promise<ThoughtRecord[]> {
    return this.prisma.thoughtRecord.findMany({
      where: { studentId, ...(since ? { syncedAt: { gt: since } } : {}) },
      orderBy: { at: 'asc' },
    });
  }

  save(
    id: string,
    studentId: string,
    data: ThoughtRecordData,
  ): Promise<ThoughtRecord> {
    return this.prisma.thoughtRecord.upsert({
      where: { id },
      update: data,
      create: { id, studentId, ...data },
    });
  }

  markDeleted(id: string, now: Date): Promise<ThoughtRecord> {
    return this.prisma.thoughtRecord.update({
      where: { id },
      data: {
        deletedAt: now,
        updatedAt: now,
        situation: null,
        thought: null,
        action: null,
        balanced: null,
        feeling: [],
        traps: [],
        beliefBefore: null,
        beliefAfter: null,
      },
    });
  }
}
