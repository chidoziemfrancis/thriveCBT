import { Injectable } from '@nestjs/common';

import type {
  ToolkitItem,
  ToolUse,
} from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

const since = (studentId: string, after?: Date) => ({
  studentId,
  ...(after ? { syncedAt: { gt: after } } : {}),
});

@Injectable()
export class ToolkitRepository {
  constructor(private readonly prisma: PrismaService) {}

  findItem(studentId: string, id: string): Promise<ToolkitItem | null> {
    return this.prisma.toolkitItem.findUnique({
      where: { studentId_id: { studentId, id } },
    });
  }

  itemsChangedSince(studentId: string, after?: Date): Promise<ToolkitItem[]> {
    return this.prisma.toolkitItem.findMany({
      where: since(studentId, after),
      orderBy: { createdAt: 'asc' },
    });
  }

  saveItem(
    studentId: string,
    id: string,
    data: { cardId: string; updatedAt: Date },
  ) {
    return this.prisma.toolkitItem.upsert({
      where: { studentId_id: { studentId, id } },
      update: { ...data, deletedAt: null },
      create: { studentId, id, ...data },
    });
  }

  deleteItem(studentId: string, id: string, now: Date) {
    return this.prisma.toolkitItem.update({
      where: { studentId_id: { studentId, id } },
      data: { deletedAt: now, updatedAt: now },
    });
  }

  findUse(studentId: string, id: string): Promise<ToolUse | null> {
    return this.prisma.toolUse.findUnique({
      where: { studentId_id: { studentId, id } },
    });
  }

  usesChangedSince(studentId: string, after?: Date): Promise<ToolUse[]> {
    return this.prisma.toolUse.findMany({
      where: since(studentId, after),
      orderBy: { at: 'asc' },
    });
  }

  saveUse(
    studentId: string,
    id: string,
    data: { cardId: string; helped: number; at: Date; updatedAt: Date },
  ) {
    return this.prisma.toolUse.upsert({
      where: { studentId_id: { studentId, id } },
      update: data,
      create: { studentId, id, ...data },
    });
  }

  deleteUse(studentId: string, id: string, now: Date) {
    return this.prisma.toolUse.update({
      where: { studentId_id: { studentId, id } },
      data: { deletedAt: now, updatedAt: now },
    });
  }
}
