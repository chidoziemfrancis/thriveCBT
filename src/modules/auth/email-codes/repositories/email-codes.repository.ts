import { Injectable } from '@nestjs/common';

import type {
  EmailCode,
  EmailCodePurpose,
} from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class EmailCodesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async replace(
    data: {
      userId: string;
      purpose: EmailCodePurpose;
      codeHash: string;
      expiresAt: Date;
    },
    now: Date,
  ) {
    await this.prisma.$transaction([
      this.prisma.emailCode.updateMany({
        where: { userId: data.userId, purpose: data.purpose, usedAt: null },
        data: { usedAt: now },
      }),
      this.prisma.emailCode.create({ data }),
    ]);
  }

  findActive(
    userId: string,
    purpose: EmailCodePurpose,
  ): Promise<EmailCode | null> {
    return this.prisma.emailCode.findFirst({
      where: { userId, purpose, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addAttempt(id: string): Promise<number> {
    const { attempts } = await this.prisma.emailCode.update({
      where: { id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    });
    return attempts;
  }

  async markUsed(id: string, now: Date): Promise<boolean> {
    const { count } = await this.prisma.emailCode.updateMany({
      where: { id, usedAt: null },
      data: { usedAt: now },
    });
    return count === 1;
  }
}
