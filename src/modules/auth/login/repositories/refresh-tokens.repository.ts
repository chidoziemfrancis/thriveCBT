import { Injectable } from '@nestjs/common';

import type { RefreshToken } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class RefreshTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    userId: string;
    familyId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return this.prisma.refreshToken.create({ data });
  }

  findByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  async revokeIfActive(id: string, now: Date): Promise<boolean> {
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: now },
    });
    return count === 1;
  }

  async revokeFamily(familyId: string, now: Date): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: now },
    });
  }
}
