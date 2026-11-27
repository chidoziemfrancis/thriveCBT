import type { Alert } from '../../../generated/prisma/client.js';
import type { EmailService } from '../../../integrations/email/email.service.js';
import { AlertRequestedEvent } from '../../../events/alert-requested.event.js';
import { StudentAssignedEvent } from '../../../events/student-assigned.event.js';
import type { AlertsRepository } from '../repositories/alerts.repository.js';
import { AlertsService } from '../services/alerts.service.js';

const NOW = new Date('2026-11-27T10:00:00Z');
const urgent = new AlertRequestedEvent(
  's1',
  'QUESTION_9',
  true,
  'Answered question 9 above zero',
  'p1',
  'q',
  'Answer: Several days',
);
const routine = new AlertRequestedEvent(
  's1',
  'SEVERE',
  false,
  'Severe PHQ-9 score (21)',
  'p1',
);

function setup(researcherId: string | null) {
  const saved: Alert[] = [];
  const repository = {
    researcherFor: vi.fn(async () => researcherId),
    raise: vi.fn(
      async (event: AlertRequestedEvent, assignee: string | null) => {
        const existing = saved.find(
          (a) => a.kind === event.kind && a.sourceId === event.sourceId,
        );
        if (existing) return { alert: existing, created: false };
        const alert = { ...event, researcherId: assignee } as unknown as Alert;
        saved.push(alert);
        return { alert, created: true };
      },
    ),
    assignWaiting: vi.fn(async () =>
      saved.filter((a) => a.researcherId === null),
    ),
    researcherContact: vi.fn(async () => ({
      email: 'grace@uni.edu',
      researcherProfile: { name: 'Grace Bello' },
    })),
    leadEmails: vi.fn(async () => ['lead@thrivecbt.test']),
  };
  const email = {
    send: vi.fn(
      async (_message: { to: string; subject: string; text: string }) =>
        undefined,
    ),
  };
  const service = new AlertsService(
    repository as unknown as AlertsRepository,
    email as unknown as EmailService,
  );
  return { service, repository, email, saved };
}

describe('AlertsService', () => {
  it('saves an urgent alert for the student’s researcher and emails them without any details', async () => {
    const { service, email, saved } = setup('r-grace');
    await service.onAlertRequested(urgent, NOW);
    expect(saved[0]).toMatchObject({ researcherId: 'r-grace', urgent: true });
    const message = email.send.mock.calls[0][0];
    expect(message.to).toBe('grace@uni.edu');
    expect(message.text).not.toMatch(/question 9|Several days|s1/i);
  });

  it('tells the study lead when the student has no researcher yet', async () => {
    const { service, email } = setup(null);
    await service.onAlertRequested(urgent, NOW);
    expect(email.send.mock.calls.map((call) => call[0].to)).toEqual([
      'lead@thrivecbt.test',
    ]);
  });

  it('emails only once for the same alert, and never for routine ones', async () => {
    const { service, email } = setup('r-grace');
    await service.onAlertRequested(urgent, NOW);
    await service.onAlertRequested(urgent, NOW);
    await service.onAlertRequested(routine, NOW);
    expect(email.send).toHaveBeenCalledTimes(1);
  });

  it('keeps the saved alert when the email fails', async () => {
    const { service, email, saved } = setup('r-grace');
    email.send.mockRejectedValueOnce(new Error('Unosend down'));
    await expect(
      service.onAlertRequested(urgent, NOW),
    ).resolves.toBeUndefined();
    expect(saved).toHaveLength(1);
  });

  it('hands waiting urgent alerts to the new researcher and emails them', async () => {
    const { service, email } = setup(null);
    await service.onAlertRequested(urgent, NOW);
    email.send.mockClear();
    await service.onStudentAssigned(new StudentAssignedEvent('s1', 'r-grace'));
    expect(email.send.mock.calls.map((call) => call[0].to)).toEqual([
      'grace@uni.edu',
    ]);
  });
});
