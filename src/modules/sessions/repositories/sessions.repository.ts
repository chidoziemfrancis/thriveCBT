import { Injectable } from '@nestjs/common';

import type {
  Prisma,
  SessionProgress,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(studentId: string, sessionId: number): Promise<SessionProgress | null> {
    return this.prisma.sessionProgress.findUnique({
      where: { studentId_sessionId: { studentId, sessionId } },
    });
  }

  changedSince(studentId: string, since?: Date): Promise<SessionProgress[]> {
    return this.prisma.sessionProgress.findMany({
      where: { studentId, ...(since ? { syncedAt: { gt: since } } : {}) },
      orderBy: { sessionId: 'asc' },
    });
  }

  save(
    studentId: string,
    sessionId: number,
    data: {
      done: string[];
      answers: Prisma.InputJsonValue;
      completedAt: Date | null;
      updatedAt: Date;
    },
  ): Promise<SessionProgress> {
    return this.prisma.sessionProgress.upsert({
      where: { studentId_sessionId: { studentId, sessionId } },
      update: data,
      create: { studentId, sessionId, ...data },
    });
  }
}
