import { Injectable } from '@nestjs/common';

import type {
  Phq9Kind,
  Phq9Result,
} from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class Phq9Repository {
  constructor(private readonly prisma: PrismaService) {}

  find(studentId: string, kind: Phq9Kind): Promise<Phq9Result | null> {
    return this.prisma.phq9Result.findUnique({
      where: { studentId_kind: { studentId, kind } },
    });
  }

  list(studentId: string): Promise<Phq9Result[]> {
    return this.prisma.phq9Result.findMany({
      where: { studentId },
      orderBy: { takenAt: 'asc' },
    });
  }

  create(data: {
    studentId: string;
    kind: Phq9Kind;
    answers: number[];
    score: number;
    item9: number;
    takenAt: Date;
  }) {
    return this.prisma.phq9Result.create({ data });
  }
}
