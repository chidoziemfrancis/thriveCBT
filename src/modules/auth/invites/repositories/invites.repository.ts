import { Injectable } from '@nestjs/common';

import type { Invite } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class InvitesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async replace(
    data: {
      email: string;
      name: string;
      tokenHash: string;
      invitedById: string | null;
      expiresAt: Date;
    },
    now: Date,
  ): Promise<Invite> {
    const [, invite] = await this.prisma.$transaction([
      this.prisma.invite.updateMany({
        where: { email: data.email, acceptedAt: null, revokedAt: null },
        data: { revokedAt: now },
      }),
      this.prisma.invite.create({ data }),
    ]);
    return invite;
  }

  findByHash(tokenHash: string): Promise<Invite | null> {
    return this.prisma.invite.findUnique({ where: { tokenHash } });
  }

  async markAccepted(id: string, now: Date): Promise<boolean> {
    const { count } = await this.prisma.invite.updateMany({
      where: { id, acceptedAt: null, revokedAt: null },
      data: { acceptedAt: now },
    });
    return count === 1;
  }
}
