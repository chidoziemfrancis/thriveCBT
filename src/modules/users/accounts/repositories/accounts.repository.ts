import { Injectable } from '@nestjs/common';

import {
  UserRole,
  UserStatus,
  type User,
} from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class AccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  leadEmails(): Promise<string[]> {
    return this.prisma.user
      .findMany({
        where: { role: UserRole.LEAD, status: UserStatus.ACTIVE },
        select: { email: true },
      })
      .then((rows) => rows.map((row) => row.email));
  }

  markEmailVerified(id: string, at: Date): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { emailVerifiedAt: at },
    });
  }

  setPassword(
    id: string,
    passwordHash: string,
    verifiedAt: Date,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash, emailVerifiedAt: verifiedAt },
    });
  }

  async inviteCodeTaken(inviteCode: string): Promise<boolean> {
    return (
      (await this.prisma.researcherProfile.count({ where: { inviteCode } })) > 0
    );
  }

  createResearcher(data: {
    email: string;
    passwordHash: string;
    name: string;
    inviteCode: string;
    verifiedAt: Date;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: UserRole.RESEARCHER,
        emailVerifiedAt: data.verifiedAt,
        researcherProfile: {
          create: { name: data.name, inviteCode: data.inviteCode },
        },
      },
    });
  }

  createLead(
    email: string,
    passwordHash: string,
    verifiedAt: Date,
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.LEAD,
        emailVerifiedAt: verifiedAt,
      },
    });
  }

  createStudent(email: string, passwordHash: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.STUDENT,
        studentProfile: { create: {} },
      },
    });
  }
}
