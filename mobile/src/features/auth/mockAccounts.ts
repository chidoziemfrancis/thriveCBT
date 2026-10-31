import { readJson, writeJson } from '@/lib/storage';

import type { Role } from './roles';

type MockAccount = { role: Role; password: string };

const REGISTERED_KEY = 'mock_registered_accounts';

// Stand-in for the backend until auth exists. Researchers never sign up in the app, so a
// researcher can only be one of these pre-created accounts.
const SEED_ACCOUNTS: Record<string, MockAccount> = {
  'test@gmail.com': { role: 'student', password: 'password123' },
  'researcher@thrivecbt.com': { role: 'researcher', password: 'password123' },
};

function normalise(email: string) {
  return email.trim().toLowerCase();
}

function allAccounts(): Record<string, MockAccount> {
  return { ...readJson<Record<string, MockAccount>>(REGISTERED_KEY, {}), ...SEED_ACCOUNTS };
}

export function accountExists(email: string): boolean {
  return normalise(email) in allAccounts();
}

/** The account's role when the password matches, otherwise null. */
export function signIn(email: string, password: string): Role | null {
  const account = allAccounts()[normalise(email)];
  return account && account.password === password ? account.role : null;
}

// Kept in on-device storage only so sign-out and sign-in work end to end in the mock; the
// real auth API will own passwords and store them hashed.
export function registerStudent(email: string, password: string) {
  const registered = readJson<Record<string, MockAccount>>(REGISTERED_KEY, {});
  writeJson(REGISTERED_KEY, {
    ...registered,
    [normalise(email)]: { role: 'student', password },
  });
}
