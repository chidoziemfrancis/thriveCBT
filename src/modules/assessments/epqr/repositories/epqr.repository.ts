import { Injectable } from '@nestjs/common';

import type { EpqrResult } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class EpqrRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(studentId: string): Promise<EpqrResult | null> {
    return this.prisma.epqrResult.findUnique({ where: { studentId } });
  }

  create(data: {
    studentId: string;
    answers: boolean[];
    psychoticism: number;
    extraversion: number;
    neuroticism: number;
    lie: number;
    wishedDead: boolean;
    takenAt: Date;
  }): Promise<EpqrResult> {
    return this.prisma.epqrResult.create({ data });
  }
}
