import type { Role } from './roles';

type MockAccount = { role: Role; password: string };

// Stand-in for the backend until auth exists. Researchers never sign up in the app, so a
// researcher can only be one of these pre-created accounts.
const ACCOUNTS: Record<string, MockAccount> = {
  'test@gmail.com': { role: 'student', password: 'password123' },
  'researcher@thrivecbt.com': { role: 'researcher', password: 'password123' },
};

function normalise(email: string) {
  return email.trim().toLowerCase();
}

export function accountExists(email: string): boolean {
  return normalise(email) in ACCOUNTS;
}

/** The account's role when the password matches, otherwise null. */
export function signIn(email: string, password: string): Role | null {
  const account = ACCOUNTS[normalise(email)];
  return account && account.password === password ? account.role : null;
}
