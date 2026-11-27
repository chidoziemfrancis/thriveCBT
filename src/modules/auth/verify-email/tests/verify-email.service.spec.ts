import type { User } from '../../../../generated/prisma/client.js';
import type { EmailService } from '../../../../integrations/email/email.service.js';
import type { AccountsService } from '../../../users/accounts/services/accounts.service.js';
import type { EmailCodesService } from '../../email-codes/services/email-codes.service.js';
import { VerifyEmailService } from '../services/verify-email.service.js';

function setup(verified = false) {
  const user = {
    id: 'u1',
    email: 'ada@uni.edu',
    role: 'STUDENT',
    status: 'ACTIVE',
    emailVerifiedAt: verified ? new Date() : null,
    createdAt: new Date('2026-11-01T00:00:00Z'),
  } as User;
  const accounts = {
    getById: vi.fn(async () => user),
    markEmailVerified: vi.fn(async () => ({
      ...user,
      emailVerifiedAt: new Date(),
    })),
  };
  const codes = {
    issue: vi.fn(async () => '123456'),
    consume: vi.fn(async () => undefined),
  };
  const email = { send: vi.fn(async () => undefined) };
  const service = new VerifyEmailService(
    accounts as unknown as AccountsService,
    codes as unknown as EmailCodesService,
    email as unknown as EmailService,
  );
  return { service, accounts, codes, email, user };
}

describe('VerifyEmailService', () => {
  it('emails a code to the student', async () => {
    const { service, email, user } = setup();
    await service.sendCode(user);
    expect(email.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ada@uni.edu',
        text: expect.stringContaining('123456'),
      }),
    );
  });

  it('sends nothing once the email is confirmed', async () => {
    const { service, email, user } = setup(true);
    await service.sendCode(user);
    expect(email.send).not.toHaveBeenCalled();
  });

  it('confirms the email with the right code', async () => {
    const { service, codes } = setup();
    await expect(service.verify('u1', '123456')).resolves.toMatchObject({
      emailVerified: true,
    });
    expect(codes.consume).toHaveBeenCalledWith('u1', 'VERIFY_EMAIL', '123456');
  });

  it('is safe to call again after confirming', async () => {
    const { service, codes } = setup(true);
    await expect(service.verify('u1', '000000')).resolves.toMatchObject({
      emailVerified: true,
    });
    expect(codes.consume).not.toHaveBeenCalled();
  });
});
