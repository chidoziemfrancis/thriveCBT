import { Injectable } from '@nestjs/common';

import type { Consent } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class ConsentRepository {
  constructor(private readonly prisma: PrismaService) {}

  latest(userId: string): Promise<Consent | null> {
    return this.prisma.consent.findFirst({
      where: { userId },
      orderBy: { agreedAt: 'desc' },
    });
  }

  record(userId: string, version: string, agreedAt: Date): Promise<Consent> {
    return this.prisma.consent.upsert({
      where: { userId_version: { userId, version } },
      update: {},
      create: { userId, version, agreedAt },
    });
  }
}
