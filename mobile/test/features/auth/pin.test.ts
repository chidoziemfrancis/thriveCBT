import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { MAX_PIN_ATTEMPTS, RELOCK_AFTER_MS, isWeakPin, shouldRelock } from '@/features/auth/pin';
import { checkPin, clearPin, hasPin, savePin } from '@/features/auth/pinStore';

const mockKeychain = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItem: (key: string) => mockKeychain.get(key) ?? null,
  setItemAsync: async (key: string, value: string) => {
    mockKeychain.set(key, value);
  },
  deleteItemAsync: async (key: string) => {
    mockKeychain.delete(key);
  },
}));

let mockUuid = 0;
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: async (_algorithm: string, data: string) => `hashed(${data})`,
  randomUUID: () => `salt-${++mockUuid}`,
}));

beforeEach(() => mockKeychain.clear());

describe('isWeakPin', () => {
  it('rejects repeated digits and straight runs either way', () => {
    ['0000', '1111', '1234', '6789', '9876', '3210'].forEach((pin) =>
      expect(isWeakPin(pin)).toBe(true)
    );
  });

  it('accepts less obvious PINs', () => {
    ['1357', '2580', '0987', '4729', '1122'].forEach((pin) => expect(isWeakPin(pin)).toBe(false));
  });

  it('rejects the wrong length', () => {
    expect(isWeakPin('123')).toBe(true);
    expect(isWeakPin('48291')).toBe(true);
  });
});

describe('shouldRelock', () => {
  const now = 1_000_000_000;

  it('relocks only after being away long enough', () => {
    expect(shouldRelock(now - RELOCK_AFTER_MS, now)).toBe(true);
    expect(shouldRelock(now - RELOCK_AFTER_MS + 1, now)).toBe(false);
    expect(shouldRelock(null, now)).toBe(false);
  });
});

describe('pin store', () => {
  it('never stores the PIN as typed', async () => {
    await savePin('4729');
    expect(hasPin()).toBe(true);
    expect(JSON.stringify([...mockKeychain.values()])).not.toContain('"4729"');
    expect(JSON.stringify([...mockKeychain.values()])).toContain('hashed(');
  });

  it('accepts the right PIN and rejects a wrong one', async () => {
    await savePin('4729');
    expect(await checkPin('4729')).toEqual({ ok: true });
    expect(await checkPin('1111')).toEqual({ ok: false, attemptsLeft: MAX_PIN_ATTEMPTS - 1 });
  });

  it('resets the count after a correct PIN', async () => {
    await savePin('4729');
    await checkPin('0000');
    await checkPin('0000');
    await checkPin('4729');
    expect(await checkPin('0000')).toEqual({ ok: false, attemptsLeft: MAX_PIN_ATTEMPTS - 1 });
  });

  it('wipes the PIN after too many wrong tries, forcing a password sign-in', async () => {
    await savePin('4729');
    for (let i = 1; i < MAX_PIN_ATTEMPTS; i += 1) await checkPin('0000');
    expect(await checkPin('0000')).toEqual({ ok: false, attemptsLeft: 0 });
    expect(hasPin()).toBe(false);
    expect(await checkPin('4729')).toEqual({ ok: false, attemptsLeft: 0 });
  });

  it('uses a fresh salt each time a PIN is saved', async () => {
    await savePin('4729');
    const first = mockKeychain.get('pin_hash');
    await clearPin();
    await savePin('4729');
    expect(mockKeychain.get('pin_hash')).not.toEqual(first);
  });
});
