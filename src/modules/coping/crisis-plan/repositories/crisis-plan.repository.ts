import { Injectable } from '@nestjs/common';

import type { CrisisPlanProgress } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class CrisisPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(studentId: string): Promise<CrisisPlanProgress | null> {
    return this.prisma.crisisPlanProgress.findUnique({ where: { studentId } });
  }

  save(studentId: string, data: { partsFilled: number; updatedAt: Date }) {
    return this.prisma.crisisPlanProgress.upsert({
      where: { studentId },
      update: data,
      create: { studentId, ...data },
    });
  }
}
