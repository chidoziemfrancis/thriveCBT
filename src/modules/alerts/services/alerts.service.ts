import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  ALERT_REQUESTED,
  AlertRequestedEvent,
} from '../../../events/alert-requested.event.js';
import {
  STUDENT_ASSIGNED,
  StudentAssignedEvent,
} from '../../../events/student-assigned.event.js';
import { EmailService } from '../../../integrations/email/email.service.js';
import { AccountsService } from '../../users/accounts/services/accounts.service.js';
import { AlertsRepository } from '../repositories/alerts.repository.js';

// Emails never carry names, answers or what the alert is about; the details stay in the app.
const URGENT_SUBJECT = 'Urgent: a student needs your attention';

@Injectable()
export class AlertsService {
  constructor(
    private readonly repository: AlertsRepository,
    private readonly email: EmailService,
    private readonly accounts: AccountsService,
  ) {}

  // Errors are not suppressed: if the alert can't be saved, the request that raised it fails.
  @OnEvent(ALERT_REQUESTED, { suppressErrors: false })
  async onAlertRequested(
    event: AlertRequestedEvent,
    now = new Date(),
  ): Promise<void> {
    const researcherId = await this.repository.researcherFor(event.studentId);
    const { created } = await this.repository.raise(event, researcherId, now);
    if (created && event.urgent) await this.notifyUrgent(researcherId);
  }

  @OnEvent(STUDENT_ASSIGNED, { suppressErrors: false })
  async onStudentAssigned(event: StudentAssignedEvent): Promise<void> {
    const waiting = await this.repository.assignWaiting(
      event.studentId,
      event.researcherId,
    );
    if (waiting.some((alert) => alert.urgent))
      await this.notifyUrgent(event.researcherId);
  }

  // A failed email is logged by EmailService and never undoes the saved alert.
  private async notifyUrgent(researcherId: string | null): Promise<void> {
    if (researcherId) {
      const researcher = await this.repository.researcherContact(researcherId);
      if (!researcher) return;
      await this.email
        .send({
          to: researcher.email,
          subject: URGENT_SUBJECT,
          text: `Hello ${researcher.researcherProfile?.name ?? 'there'},\n\nOne of your students has an urgent alert in ThriveCBT. Please open the app to see it and follow the safety steps as soon as you can.\n\nThis email never includes names or answers, to keep them private.`,
        })
        .catch(() => undefined);
      return;
    }
    for (const to of await this.accounts.leadEmails()) {
      await this.email
        .send({
          to,
          subject: URGENT_SUBJECT,
          text: 'A student who hasn’t been matched with a researcher yet has an urgent alert in ThriveCBT. Please check it as soon as you can.\n\nThis email never includes names or answers, to keep them private.',
        })
        .catch(() => undefined);
    }
  }
}
