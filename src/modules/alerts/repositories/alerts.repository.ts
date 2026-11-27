import { Injectable } from '@nestjs/common';

import type { Alert } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import type { AlertRequestedEvent } from '../../../events/alert-requested.event.js';

@Injectable()
export class AlertsRepository {
  constructor(private readonly prisma: PrismaService) {}

  researcherFor(studentId: string): Promise<string | null> {
    return this.prisma.assignment
      .findUnique({ where: { studentId }, select: { researcherId: true } })
      .then((row) => row?.researcherId ?? null);
  }

  /** Creates the alert unless the same kind was already raised from the same source. */
  async raise(
    event: AlertRequestedEvent,
    researcherId: string | null,
    now: Date,
  ) {
    const existing = await this.prisma.alert.findUnique({
      where: { kind_sourceId: { kind: event.kind, sourceId: event.sourceId } },
    });
    if (existing) return { alert: existing, created: false };
    const alert = await this.prisma.alert.create({
      data: {
        studentId: event.studentId,
        researcherId,
        kind: event.kind,
        urgent: event.urgent,
        title: event.title,
        quote: event.quote,
        detail: event.detail,
        sourceId: event.sourceId,
        raisedAt: now,
      },
    });
    return { alert, created: true };
  }

  /** Hands alerts raised before the student was matched to their new researcher. */
  async assignWaiting(
    studentId: string,
    researcherId: string,
  ): Promise<Alert[]> {
    const waiting = await this.prisma.alert.findMany({
      where: { studentId, researcherId: null },
    });
    if (waiting.length > 0) {
      await this.prisma.alert.updateMany({
        where: { studentId, researcherId: null },
        data: { researcherId },
      });
    }
    return waiting;
  }

  researcherContact(researcherId: string) {
    return this.prisma.user.findUnique({
      where: { id: researcherId },
      select: { email: true, researcherProfile: { select: { name: true } } },
    });
  }
}
