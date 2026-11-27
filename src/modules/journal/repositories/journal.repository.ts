import { Injectable } from '@nestjs/common';

import type { JournalEntry } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

export type JournalData = {
  prompt: string | null;
  text: string;
  mood: number | null;
  sessionId: number | null;
  at: Date;
  editedAt: Date | null;
  updatedAt: Date;
};

@Injectable()
export class JournalRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(id: string): Promise<JournalEntry | null> {
    return this.prisma.journalEntry.findUnique({ where: { id } });
  }

  changedSince(studentId: string, since?: Date): Promise<JournalEntry[]> {
    return this.prisma.journalEntry.findMany({
      where: { studentId, ...(since ? { syncedAt: { gt: since } } : {}) },
      orderBy: { at: 'asc' },
    });
  }

  /** `data.text` must already be encrypted. */
  save(
    id: string,
    studentId: string,
    data: JournalData,
  ): Promise<JournalEntry> {
    return this.prisma.journalEntry.upsert({
      where: { id },
      update: data,
      create: { id, studentId, ...data },
    });
  }

  markDeleted(id: string, now: Date): Promise<JournalEntry> {
    return this.prisma.journalEntry.update({
      where: { id },
      data: {
        deletedAt: now,
        updatedAt: now,
        text: null,
        prompt: null,
        mood: null,
      },
    });
  }
}
