import { Injectable } from '@nestjs/common';

import type { MoodEntry } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class MoodRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(id: string): Promise<MoodEntry | null> {
    return this.prisma.moodEntry.findUnique({ where: { id } });
  }

  changedSince(studentId: string, since?: Date): Promise<MoodEntry[]> {
    return this.prisma.moodEntry.findMany({
      where: { studentId, ...(since ? { syncedAt: { gt: since } } : {}) },
      orderBy: { at: 'asc' },
    });
  }

  save(
    id: string,
    studentId: string,
    data: { mood: number; note: string | null; at: Date; updatedAt: Date },
  ): Promise<MoodEntry> {
    return this.prisma.moodEntry.upsert({
      where: { id },
      update: data,
      create: { id, studentId, ...data },
    });
  }

  markDeleted(id: string, now: Date): Promise<MoodEntry> {
    return this.prisma.moodEntry.update({
      where: { id },
      data: { deletedAt: now, updatedAt: now, note: null },
    });
  }
}
