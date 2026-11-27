import { readJson, writeJson } from '@/lib/storage';

const STORAGE_KEY = 'study_withdrawal';

// Kept even after sign-out: the study must know a participant withdrew, and when.
export type Withdrawal = { at: string; reason?: string };

export function getWithdrawal(): Withdrawal | null {
  return readJson<Withdrawal | null>(STORAGE_KEY, null);
}

/** Written from the server's answer, so the date is the one the study recorded. */
export function saveWithdrawalOnPhone(at: string, reason?: string) {
  writeJson(STORAGE_KEY, { at, reason } satisfies Withdrawal);
}

/** The phrase a participant types to confirm, so withdrawing can't happen by accident. */
export const WITHDRAW_PHRASE = 'WITHDRAW';

export function confirmsWithdrawal(typed: string): boolean {
  return typed.trim().toUpperCase() === WITHDRAW_PHRASE;
}
