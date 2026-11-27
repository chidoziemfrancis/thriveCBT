import type { Withdrawal } from '../../../generated/prisma/client.js';
import type { EmailService } from '../../../integrations/email/email.service.js';
import type { StudentsService } from '../../users/students/services/students.service.js';
import { withdrawSchema } from '../dto/withdrawal.dto.js';
import type { WithdrawalRepository } from '../repositories/withdrawal.repository.js';
import { WithdrawalService } from '../services/withdrawal.service.js';

const NOW = new Date('2026-11-27T10:00:00Z');

function setup(matched = true) {
  let saved: Withdrawal | null = null;
  const repository = {
    find: vi.fn(async () => saved),
    withdraw: vi.fn(
      async (studentId: string, reason: string | undefined, now: Date) => {
        saved = { studentId, reason, withdrawnAt: now } as Withdrawal;
        return saved;
      },
    ),
    researcherFor: vi.fn(async () =>
      matched
        ? {
            email: 'grace@uni.edu',
            researcherProfile: { name: 'Grace Bello' },
          }
        : null,
    ),
  };
  const students = { getProfile: vi.fn(async () => ({ name: 'Kemi' })) };
  const email = {
    send: vi.fn(
      async (_message: { to: string; subject: string; text: string }) =>
        undefined,
    ),
  };
  const service = new WithdrawalService(
    repository as unknown as WithdrawalRepository,
    students as unknown as StudentsService,
    email as unknown as EmailService,
  );
  return { service, repository, email };
}

describe('WithdrawalService', () => {
  it('records the withdrawal and tells the researcher, without the reason', async () => {
    const { service, repository, email } = setup();
    await expect(
      service.withdraw(
        's1',
        { reason: 'Too busy with exams', confirm: 'withdraw ' },
        NOW,
      ),
    ).resolves.toEqual({ at: NOW.toISOString() });
    expect(repository.withdraw).toHaveBeenCalledWith(
      's1',
      'Too busy with exams',
      NOW,
    );
    expect(email.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'grace@uni.edu',
        subject: 'Kemi has left the study',
      }),
    );
    expect(email.send.mock.calls[0][0].text).not.toContain('exams');
  });

  it('refuses anything but the typed phrase', async () => {
    const { service, repository } = setup();
    await expect(
      service.withdraw('s1', { confirm: 'yes' }, NOW),
    ).rejects.toMatchObject({ code: 'WITHDRAW_CONFIRM_MISMATCH' });
    expect(repository.withdraw).not.toHaveBeenCalled();
  });

  it('returns the first date when sent again, and emails once', async () => {
    const { service, repository, email } = setup();
    await service.withdraw('s1', { confirm: 'WITHDRAW' }, NOW);
    await expect(
      service.withdraw(
        's1',
        { confirm: 'WITHDRAW' },
        new Date('2026-11-28T10:00:00Z'),
      ),
    ).resolves.toEqual({ at: NOW.toISOString() });
    expect(repository.withdraw).toHaveBeenCalledTimes(1);
    expect(email.send).toHaveBeenCalledTimes(1);
  });

  it('still withdraws when the email fails, or when nobody was matched yet', async () => {
    const failing = setup();
    failing.email.send.mockRejectedValueOnce(new Error('Unosend down'));
    await expect(
      failing.service.withdraw('s1', { confirm: 'WITHDRAW' }, NOW),
    ).resolves.toEqual({ at: NOW.toISOString() });

    const unmatched = setup(false);
    await unmatched.service.withdraw('s1', { confirm: 'WITHDRAW' }, NOW);
    expect(unmatched.email.send).not.toHaveBeenCalled();
  });

  it('treats a blank reason as no reason', async () => {
    const { service, repository } = setup();
    const body = withdrawSchema.parse({ reason: '   ', confirm: 'WITHDRAW' });
    await service.withdraw('s1', body, NOW);
    expect(repository.withdraw).toHaveBeenCalledWith('s1', undefined, NOW);
  });
});
