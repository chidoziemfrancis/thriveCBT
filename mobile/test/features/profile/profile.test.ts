import { describe, expect, it, jest } from '@jest/globals';

import { isValidPhone } from '@/features/profile/contactValidation';
import { WITHDRAW_PHRASE, confirmsWithdrawal } from '@/features/profile/withdrawalStore';

jest.mock('@/lib/storage', () => ({
  readJson: (_key: string, fallback: unknown) => fallback,
  writeJson: () => {},
  removeKey: () => {},
}));

describe('isValidPhone', () => {
  it('accepts local and international formats', () => {
    ['08031234567', '+234 803 123 4567', '(0803) 123-4567', '+44 20 7946 0958'].forEach((phone) =>
      expect(isValidPhone(phone)).toBe(true)
    );
  });

  it('rejects letters, too few digits and too many', () => {
    ['call me', '12345', '0803-ABC-4567', '+1234567890123456', ''].forEach((phone) =>
      expect(isValidPhone(phone)).toBe(false)
    );
  });
});

describe('confirmsWithdrawal', () => {
  it('needs the exact phrase, ignoring case and spaces', () => {
    expect(confirmsWithdrawal(WITHDRAW_PHRASE)).toBe(true);
    expect(confirmsWithdrawal('  withdraw ')).toBe(true);
    expect(confirmsWithdrawal('withdra')).toBe(false);
    expect(confirmsWithdrawal('yes')).toBe(false);
  });
});
