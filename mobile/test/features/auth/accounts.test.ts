import { describe, expect, it } from '@jest/globals';

import { accountExists, signIn } from '@/features/auth/mockAccounts';
import { homeFor } from '@/features/auth/roles';

describe('accountExists', () => {
  it('matches emails regardless of case and surrounding spaces', () => {
    expect(accountExists('  Test@Gmail.com ')).toBe(true);
    expect(accountExists('researcher@thrivecbt.com')).toBe(true);
  });

  it('treats an unknown email as a new student sign-up', () => {
    expect(accountExists('new.student@school.edu')).toBe(false);
  });
});

describe('signIn', () => {
  it('returns the account role for the right password', () => {
    expect(signIn('test@gmail.com', 'password123')).toBe('student');
    expect(signIn('RESEARCHER@thrivecbt.com', 'password123')).toBe('researcher');
  });

  it('rejects a wrong password or an unknown email', () => {
    expect(signIn('test@gmail.com', 'wrong')).toBeNull();
    expect(signIn('nobody@school.edu', 'password123')).toBeNull();
  });
});

describe('homeFor', () => {
  it('sends each role to its own side of the app', () => {
    expect(homeFor('student')).toBe('/dashboard');
    expect(homeFor('researcher')).toBe('/researcher');
  });
});
