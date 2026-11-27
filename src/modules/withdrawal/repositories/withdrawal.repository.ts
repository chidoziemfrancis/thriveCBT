import { Injectable } from '@nestjs/common';

import {
  UserStatus,
  type Withdrawal,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class WithdrawalRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(studentId: string): Promise<Withdrawal | null> {
    return this.prisma.withdrawal.findUnique({ where: { studentId } });
  }

  /** Records the withdrawal, closes the account and signs the student out everywhere, together. */
  async withdraw(
    studentId: string,
    reason: string | undefined,
    now: Date,
  ): Promise<Withdrawal> {
    const [withdrawal] = await this.prisma.$transaction([
      this.prisma.withdrawal.create({
        data: { studentId, reason, withdrawnAt: now },
      }),
      this.prisma.user.update({
        where: { id: studentId },
        data: { status: UserStatus.WITHDRAWN },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: studentId, revokedAt: null },
        data: { revokedAt: now },
      }),
    ]);
    return withdrawal;
  }

  researcherFor(studentId: string) {
    return this.prisma.assignment
      .findUnique({
        where: { studentId },
        select: {
          researcher: {
            select: {
              email: true,
              researcherProfile: { select: { name: true } },
            },
          },
        },
      })
      .then((row) => row?.researcher ?? null);
  }
}
