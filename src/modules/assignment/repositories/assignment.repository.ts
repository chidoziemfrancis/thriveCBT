import { Injectable } from '@nestjs/common';

import {
  AssignmentMethod,
  type Prisma,
  UserStatus,
} from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

const withResearcher = {
  researcher: { select: { id: true, email: true, researcherProfile: true } },
} satisfies Prisma.AssignmentInclude;

export type AssignmentWithResearcher = Prisma.AssignmentGetPayload<{
  include: typeof withResearcher;
}>;

export type OpenResearcher = {
  userId: string;
  capacity: number;
  students: number;
};

@Injectable()
export class AssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findForStudent(studentId: string): Promise<AssignmentWithResearcher | null> {
    return this.prisma.assignment.findUnique({
      where: { studentId },
      include: withResearcher,
    });
  }

  researcherByCode(inviteCode: string) {
    return this.prisma.researcherProfile.findFirst({
      where: { inviteCode, user: { status: UserStatus.ACTIVE } },
      include: { user: { select: { id: true, email: true } } },
    });
  }

  async acceptingResearchers(): Promise<OpenResearcher[]> {
    const profiles = await this.prisma.researcherProfile.findMany({
      where: { accepting: true, user: { status: UserStatus.ACTIVE } },
      select: {
        userId: true,
        capacity: true,
        user: { select: { _count: { select: { caseload: true } } } },
      },
    });
    return profiles.map((p) => ({
      userId: p.userId,
      capacity: p.capacity,
      students: p.user._count.caseload,
    }));
  }

  create(
    studentId: string,
    researcherId: string,
    method: AssignmentMethod,
    assignedAt: Date,
  ) {
    return this.prisma.assignment.create({
      data: { studentId, researcherId, method, assignedAt },
      include: withResearcher,
    });
  }
}
