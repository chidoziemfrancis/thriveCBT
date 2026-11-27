import { Injectable } from '@nestjs/common';

import { EmailService } from '../../../integrations/email/email.service.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { WITHDRAWAL_ERRORS } from '../../../shared/errors/codes/withdrawal.errors.js';
import { StudentsService } from '../../users/students/services/students.service.js';
import {
  WITHDRAW_PHRASE,
  type WithdrawalDto,
  type WithdrawBody,
} from '../dto/withdrawal.dto.js';
import { WithdrawalRepository } from '../repositories/withdrawal.repository.js';

function isDuplicate(error: unknown) {
  return (error as { code?: string })?.code === 'P2002';
}

@Injectable()
export class WithdrawalService {
  constructor(
    private readonly repository: WithdrawalRepository,
    private readonly students: StudentsService,
    private readonly email: EmailService,
  ) {}

  // Typed by hand, as in the app, so it can't happen by accident. Withdrawing again returns the
  // first date, so a retry after a dropped connection still succeeds.
  async withdraw(
    studentId: string,
    { reason, confirm }: WithdrawBody,
    now = new Date(),
  ): Promise<WithdrawalDto> {
    if (confirm.trim().toUpperCase() !== WITHDRAW_PHRASE)
      throw new AppError(WITHDRAWAL_ERRORS.CONFIRM_MISMATCH);

    const existing = await this.repository.find(studentId);
    if (existing) return { at: existing.withdrawnAt.toISOString() };

    try {
      const withdrawal = await this.repository.withdraw(studentId, reason, now);
      await this.tellResearcher(studentId);
      return { at: withdrawal.withdrawnAt.toISOString() };
    } catch (error) {
      if (!isDuplicate(error)) throw error;
      const first = await this.repository.find(studentId);
      return { at: (first?.withdrawnAt ?? now).toISOString() };
    }
  }

  // The reason is never emailed; it stays in the study records. A failed email changes nothing.
  private async tellResearcher(studentId: string) {
    const researcher = await this.repository.researcherFor(studentId);
    if (!researcher) return;
    const profile = await this.students.getProfile(studentId).catch(() => null);
    const student = profile?.name ?? 'One of your students';
    await this.email
      .send({
        to: researcher.email,
        subject: `${student} has left the study`,
        text: `Hello ${researcher.researcherProfile?.name ?? 'there'},\n\n${student} has chosen to withdraw from ThriveCBT. Their account is closed and they won’t receive any more sessions or reminders. You don’t need to do anything, and please don’t contact them about it.`,
      })
      .catch(() => undefined);
  }
}
