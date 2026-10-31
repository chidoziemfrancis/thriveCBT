import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { MAX_PIN_ATTEMPTS } from './pin';

const PIN_KEY = 'pin_hash';
const ATTEMPTS_KEY = 'pin_failed_attempts';

type StoredPin = { salt: string; hash: string };

// The PIN is never stored as typed: only a salted hash, in the device keychain.
function hashPin(pin: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

function readStored(): StoredPin | null {
  const raw = SecureStore.getItem(PIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredPin;
  } catch {
    return null;
  }
}

export function hasPin(): boolean {
  return readStored() !== null;
}

export async function savePin(pin: string) {
  const salt = Crypto.randomUUID();
  const stored: StoredPin = { salt, hash: await hashPin(pin, salt) };
  await SecureStore.setItemAsync(PIN_KEY, JSON.stringify(stored));
  await SecureStore.deleteItemAsync(ATTEMPTS_KEY);
}

export async function clearPin() {
  await SecureStore.deleteItemAsync(PIN_KEY);
  await SecureStore.deleteItemAsync(ATTEMPTS_KEY);
}

export type PinCheck = { ok: true } | { ok: false; attemptsLeft: number };

/** Checks a PIN; too many misses wipes it, which forces a password sign-in. */
export async function checkPin(pin: string): Promise<PinCheck> {
  const stored = readStored();
  if (!stored) return { ok: false, attemptsLeft: 0 };

  if ((await hashPin(pin, stored.salt)) === stored.hash) {
    await SecureStore.deleteItemAsync(ATTEMPTS_KEY);
    return { ok: true };
  }

  const failed = Number(SecureStore.getItem(ATTEMPTS_KEY) ?? 0) + 1;
  const attemptsLeft = Math.max(MAX_PIN_ATTEMPTS - failed, 0);
  if (attemptsLeft === 0) await clearPin();
  else await SecureStore.setItemAsync(ATTEMPTS_KEY, String(failed));
  return { ok: false, attemptsLeft };
}
