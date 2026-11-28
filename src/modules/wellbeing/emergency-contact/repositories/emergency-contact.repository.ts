import { Injectable } from '@nestjs/common';

import type { EmergencyContact } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class EmergencyContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(studentId: string): Promise<EmergencyContact | null> {
    return this.prisma.emergencyContact.findUnique({ where: { studentId } });
  }

  /** `data` must already be encrypted. */
  save(
    studentId: string,
    data: string,
    updatedAt: Date,
  ): Promise<EmergencyContact> {
    return this.prisma.emergencyContact.upsert({
      where: { studentId },
      update: { data, updatedAt, deletedAt: null },
      create: { studentId, data, updatedAt },
    });
  }

  markDeleted(studentId: string, now: Date): Promise<EmergencyContact> {
    return this.prisma.emergencyContact.update({
      where: { studentId },
      data: { data: null, updatedAt: now, deletedAt: now },
    });
  }
}
