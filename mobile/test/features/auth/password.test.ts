import { describe, expect, it } from '@jest/globals';

import { isPasswordValid, passwordChecks, passwordStrength } from '@/features/auth/password';

describe('passwordChecks', () => {
  it('ticks each rule independently as it is met', () => {
    expect(passwordChecks('abc').map((c) => c.met)).toEqual([false, false]);
    expect(passwordChecks('abcdefgh').map((c) => c.met)).toEqual([true, false]);
    expect(passwordChecks('abc1').map((c) => c.met)).toEqual([false, true]);
    expect(passwordChecks('abcdefg1').map((c) => c.met)).toEqual([true, true]);
  });
});

describe('isPasswordValid', () => {
  it('needs 8+ characters with at least one letter and one number', () => {
    expect(isPasswordValid('abcdefg1')).toBe(true);
    expect(isPasswordValid('12345678')).toBe(false);
    expect(isPasswordValid('abcdefgh')).toBe(false);
    expect(isPasswordValid('abc12')).toBe(false);
  });
});

describe('passwordStrength', () => {
  it('stays at 0 until the rules are met', () => {
    expect(passwordStrength('')).toBe(0);
    expect(passwordStrength('short1')).toBe(0);
  });

  it('rises with length and character variety', () => {
    expect(passwordStrength('abcdefg1')).toBe(1);
    expect(passwordStrength('abcdefghijk1')).toBe(2);
    expect(passwordStrength('Abcdefghijk1!')).toBe(3);
  });
});
