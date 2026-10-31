import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { accountExists, registerStudent, signIn } from '@/features/auth/mockAccounts';
import { homeFor } from '@/features/auth/roles';

// On-device storage is native, so tests use an in-mockMemory stand-in.
const mockMemory = new Map<string, unknown>();
jest.mock('@/lib/storage', () => ({
  readJson: (key: string, fallback: unknown) =>
    mockMemory.has(key) ? mockMemory.get(key) : fallback,
  writeJson: (key: string, value: unknown) => mockMemory.set(key, value),
  removeKey: (key: string) => mockMemory.delete(key),
}));

beforeEach(() => mockMemory.clear());

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

describe('registerStudent', () => {
  it('lets a newly registered student sign back in as a student', () => {
    registerStudent(' New.Student@School.edu ', 'hello1234');

    expect(accountExists('new.student@school.edu')).toBe(true);
    expect(signIn('new.student@school.edu', 'hello1234')).toBe('student');
    expect(signIn('new.student@school.edu', 'wrong')).toBeNull();
  });

  it('cannot overwrite a seeded account, so nobody can sign up as a researcher', () => {
    registerStudent('researcher@thrivecbt.com', 'takeover1');

    expect(signIn('researcher@thrivecbt.com', 'takeover1')).toBeNull();
    expect(signIn('researcher@thrivecbt.com', 'password123')).toBe('researcher');
  });
});

describe('homeFor', () => {
  it('sends each role to its own side of the app', () => {
    expect(homeFor('student')).toBe('/dashboard');
    expect(homeFor('researcher')).toBe('/researcher');
  });
});
