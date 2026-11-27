import { Injectable } from '@nestjs/common';

import type {
  Prisma,
  StudentProfile,
} from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<StudentProfile | null> {
    return this.prisma.studentProfile.findUnique({ where: { userId } });
  }

  update(
    userId: string,
    data: Prisma.StudentProfileUpdateInput,
  ): Promise<StudentProfile> {
    return this.prisma.studentProfile.update({ where: { userId }, data });
  }
}
