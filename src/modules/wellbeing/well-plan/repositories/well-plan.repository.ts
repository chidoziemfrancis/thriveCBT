import { Injectable } from '@nestjs/common';

import type { WellPlan } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class WellPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(studentId: string): Promise<WellPlan | null> {
    return this.prisma.wellPlan.findUnique({ where: { studentId } });
  }

  /** `data` must already be encrypted. */
  save(studentId: string, data: string, updatedAt: Date): Promise<WellPlan> {
    return this.prisma.wellPlan.upsert({
      where: { studentId },
      update: { data, updatedAt },
      create: { studentId, data, updatedAt },
    });
  }
}
