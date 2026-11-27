import { Injectable } from '@nestjs/common';

import type {
  PositiveEntry,
  PositiveKind,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class PositiveEntriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(id: string): Promise<PositiveEntry | null> {
    return this.prisma.positiveEntry.findUnique({ where: { id } });
  }

  changedSince(studentId: string, since?: Date): Promise<PositiveEntry[]> {
    return this.prisma.positiveEntry.findMany({
      where: { studentId, ...(since ? { syncedAt: { gt: since } } : {}) },
      orderBy: { at: 'asc' },
    });
  }

  /** `data.text` must already be encrypted. */
  save(
    id: string,
    studentId: string,
    data: { kind: PositiveKind; text: string; at: Date; updatedAt: Date },
  ): Promise<PositiveEntry> {
    return this.prisma.positiveEntry.upsert({
      where: { id },
      update: data,
      create: { id, studentId, ...data },
    });
  }

  markDeleted(id: string, now: Date): Promise<PositiveEntry> {
    return this.prisma.positiveEntry.update({
      where: { id },
      data: { deletedAt: now, updatedAt: now, text: null },
    });
  }
}
