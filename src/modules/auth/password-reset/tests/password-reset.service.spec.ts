import type { User } from '../../../../generated/prisma/client.js';
import type { EmailService } from '../../../../integrations/email/email.service.js';
import { AppError } from '../../../../shared/errors/app-error.js';
import { EMAIL_ERRORS } from '../../../../shared/errors/codes/email.errors.js';
import type { AccountsService } from '../../../users/accounts/services/accounts.service.js';
import type { EmailCodesService } from '../../email-codes/services/email-codes.service.js';
import type { TokensService } from '../../login/services/tokens.service.js';
import { PasswordResetService } from '../services/password-reset.service.js';

function setup(
  found: Partial<User> | null = {
    id: 'u1',
    email: 'ada@uni.edu',
    status: 'ACTIVE',
  },
) {
  const accounts = {
    findByEmail: vi.fn(async () => found as User | null),
    setPassword: vi.fn(async (_userId: string, _hash: string) => found),
  };
  const codes = {
    issue: vi.fn(async () => '123456'),
    consume: vi.fn(async () => undefined),
  };
  const tokens = { revokeAllForUser: vi.fn(async () => undefined) };
  const email = { send: vi.fn(async () => undefined) };
  const service = new PasswordResetService(
    accounts as unknown as AccountsService,
    codes as unknown as EmailCodesService,
    tokens as unknown as TokensService,
    email as unknown as EmailService,
  );
  return { service, accounts, codes, tokens, email };
}

const body = { email: 'ada@uni.edu', code: '123456', password: 'NewPassword1' };

describe('PasswordResetService.request', () => {
  it('emails a reset code when the account exists', async () => {
    const { service, email } = setup();
    await service.request('ada@uni.edu');
    expect(email.send).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('123456') }),
    );
  });

  it('does nothing, quietly, for an unknown email or a suspended account', async () => {
    for (const found of [
      null,
      { id: 'u1', email: 'ada@uni.edu', status: 'SUSPENDED' as const },
    ]) {
      const { service, email } = setup(found);
      await expect(service.request('ada@uni.edu')).resolves.toBeUndefined();
      expect(email.send).not.toHaveBeenCalled();
    }
  });

  it('still answers the same way when the email fails to send', async () => {
    const { service, email } = setup();
    email.send.mockRejectedValueOnce(new AppError(EMAIL_ERRORS.SEND_FAILED));
    await expect(service.request('ada@uni.edu')).resolves.toBeUndefined();
  });
});

describe('PasswordResetService.confirm', () => {
  it('sets a hashed password and logs out every device', async () => {
    const { service, accounts, tokens, codes } = setup();
    await service.confirm(body);
    expect(codes.consume).toHaveBeenCalledWith(
      'u1',
      'RESET_PASSWORD',
      '123456',
    );
    expect(accounts.setPassword.mock.calls[0][1]).toMatch(/^\$argon2id\$/);
    expect(tokens.revokeAllForUser).toHaveBeenCalledWith('u1');
  });

  it('tells the account owner their password changed, and keeps the change if that email fails', async () => {
    const { service, email, accounts } = setup();
    email.send.mockRejectedValueOnce(new Error('Unosend down'));
    await expect(service.confirm(body)).resolves.toBeUndefined();
    expect(accounts.setPassword).toHaveBeenCalled();
    expect(email.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ada@uni.edu',
        subject: 'Your ThriveCBT password was changed',
      }),
    );
  });

  it('gives the same code error for an unknown email', async () => {
    const { service, accounts } = setup(null);
    await expect(service.confirm(body)).rejects.toMatchObject({
      code: 'AUTH_CODE_INVALID',
    });
    expect(accounts.setPassword).not.toHaveBeenCalled();
  });

  it('leaves the password alone when the code is wrong', async () => {
    const { service, accounts, codes } = setup();
    codes.consume.mockRejectedValueOnce(new Error('wrong code'));
    await expect(service.confirm(body)).rejects.toThrow('wrong code');
    expect(accounts.setPassword).not.toHaveBeenCalled();
  });
});
