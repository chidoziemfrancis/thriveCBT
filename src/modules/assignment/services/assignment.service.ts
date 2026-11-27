import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AssignmentMethod } from '../../../generated/prisma/client.js';
import {
  STUDENT_ASSIGNED,
  StudentAssignedEvent,
} from '../../../events/student-assigned.event.js';
import { EmailService } from '../../../integrations/email/email.service.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { ASSIGNMENT_ERRORS } from '../../../shared/errors/codes/assignment.errors.js';
import { COMMON_ERRORS } from '../../../shared/errors/error-codes.js';
import { AccountsService } from '../../users/accounts/services/accounts.service.js';
import { StudentsService } from '../../users/students/services/students.service.js';
import type { AssignmentDto, ResearcherCard } from '../dto/assignment.dto.js';
import {
  type AssignmentWithResearcher,
  AssignmentRepository,
  type OpenResearcher,
} from '../repositories/assignment.repository.js';

/** Among researchers with space, one with the fewest students, so caseloads stay even. */
export function pickResearcher(
  open: OpenResearcher[],
  random: () => number = Math.random,
): string | null {
  const withSpace = open.filter((r) => r.students < r.capacity);
  if (withSpace.length === 0) return null;
  const fewest = Math.min(...withSpace.map((r) => r.students));
  const candidates = withSpace.filter((r) => r.students === fewest);
  return candidates[
    Math.min(Math.floor(random() * candidates.length), candidates.length - 1)
  ].userId;
}

function toDto(assignment: AssignmentWithResearcher): AssignmentDto {
  const profile = assignment.researcher.researcherProfile;
  return {
    researcher: {
      id: assignment.researcher.id,
      name: profile?.name ?? 'Your researcher',
      title: profile?.title ?? null,
      bio: profile?.bio ?? null,
    },
    method: assignment.method === AssignmentMethod.INVITE ? 'invite' : 'random',
    assignedAt: assignment.assignedAt.toISOString(),
  };
}

function isDuplicate(error: unknown) {
  return (error as { code?: string })?.code === 'P2002';
}

@Injectable()
export class AssignmentService {
  constructor(
    private readonly repository: AssignmentRepository,
    private readonly students: StudentsService,
    private readonly email: EmailService,
    private readonly events: EventEmitter2,
    private readonly accounts: AccountsService,
  ) {}

  async preview(inviteCode: string): Promise<ResearcherCard> {
    const profile = await this.repository.researcherByCode(inviteCode);
    if (!profile) throw new AppError(ASSIGNMENT_ERRORS.CODE_NOT_FOUND);
    return {
      id: profile.user.id,
      name: profile.name,
      title: profile.title,
      bio: profile.bio,
    };
  }

  async get(studentId: string): Promise<AssignmentDto> {
    const assignment = await this.repository.findForStudent(studentId);
    if (!assignment) throw new AppError(COMMON_ERRORS.NOT_FOUND);
    return toDto(assignment);
  }

  // An invite always goes to the inviting researcher, as in the app: they chose this student.
  async assign(
    studentId: string,
    inviteCode?: string,
    now = new Date(),
  ): Promise<AssignmentDto> {
    const existing = await this.repository.findForStudent(studentId);
    if (existing) return toDto(existing);

    let researcherId: string | null;
    let method: AssignmentMethod;
    if (inviteCode) {
      const inviter = await this.repository.researcherByCode(inviteCode);
      if (!inviter) throw new AppError(ASSIGNMENT_ERRORS.CODE_NOT_FOUND);
      researcherId = inviter.user.id;
      method = AssignmentMethod.INVITE;
    } else {
      researcherId = pickResearcher(
        await this.repository.acceptingResearchers(),
      );
      method = AssignmentMethod.RANDOM;
    }
    if (!researcherId) {
      await this.tellLeadsEveryoneIsFull();
      throw new AppError(ASSIGNMENT_ERRORS.NO_RESEARCHER);
    }

    let assignment: AssignmentWithResearcher;
    try {
      assignment = await this.repository.create(
        studentId,
        researcherId,
        method,
        now,
      );
    } catch (error) {
      if (!isDuplicate(error)) throw error;
      return this.get(studentId);
    }
    await this.events.emitAsync(
      STUDENT_ASSIGNED,
      new StudentAssignedEvent(studentId, researcherId),
    );
    await this.tellResearcher(studentId, assignment);
    return toDto(assignment);
  }

  // Best effort: a failed email never undoes the match. EmailService logs the failure.
  private async tellResearcher(
    studentId: string,
    assignment: AssignmentWithResearcher,
  ) {
    const profile = await this.students.getProfile(studentId).catch(() => null);
    const researcherName =
      assignment.researcher.researcherProfile?.name ?? 'there';
    const student = profile?.name ?? 'A new student';
    const invited = assignment.method === AssignmentMethod.INVITE;
    await this.email
      .send({
        to: assignment.researcher.email,
        subject: invited
          ? `${student} joined with your invite`
          : `${student} was matched with you`,
        text: invited
          ? `Hello ${researcherName},\n\n${student} accepted your invite and joined ThriveCBT. They’re now in your caseload. Open the app to say hello.`
          : `Hello ${researcherName},\n\n${student} joined ThriveCBT and was matched with you. They’re now in your caseload. Open the app to say hello.`,
      })
      .catch(() => undefined);
  }

  private async tellLeadsEveryoneIsFull() {
    const leads = await this.accounts.leadEmails().catch(() => []);
    for (const to of leads) {
      await this.email
        .send({
          to,
          subject: 'A student is waiting for a researcher',
          text: 'A student finished signing up for ThriveCBT, but every researcher is full or not taking students. Please raise a researcher’s capacity or invite another researcher so they can be matched.',
        })
        .catch(() => undefined);
    }
  }
}
