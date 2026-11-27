import { Injectable } from '@nestjs/common';

import { Phq9Kind } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class OnboardingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async studyProgress(userId: string) {
    const [phq9, epqr, assignment] = await Promise.all([
      this.prisma.phq9Result.count({
        where: { studentId: userId, kind: Phq9Kind.BASELINE },
      }),
      this.prisma.epqrResult.count({ where: { studentId: userId } }),
      this.prisma.assignment.count({ where: { studentId: userId } }),
    ]);
    return { phq9Done: phq9 > 0, epqrDone: epqr > 0, matched: assignment > 0 };
  }
}
