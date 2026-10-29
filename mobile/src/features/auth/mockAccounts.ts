const EXISTING_ACCOUNTS = new Set(['test@gmail.com']);

export function accountExists(email: string) {
  return EXISTING_ACCOUNTS.has(email.trim().toLowerCase());
}
