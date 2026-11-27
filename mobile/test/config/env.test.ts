import { describe, expect, it, jest } from '@jest/globals';

jest.mock('expo-crypto', () => ({ randomUUID: () => 'test-id' }));

import { readEnv } from '@/config/env';

describe('readEnv', () => {
  it('uses the local API in development when nothing is set', () => {
    expect(readEnv({}, true)).toEqual({ apiUrl: 'http://localhost:3000/v1' });
  });

  it('uses the address it is given, such as the Mac on the same Wi-Fi', () => {
    expect(readEnv({ apiUrl: 'http://192.168.1.20:3000/v1' }, true).apiUrl).toBe(
      'http://192.168.1.20:3000/v1'
    );
  });

  it('refuses a missing or plain-http address outside development', () => {
    expect(() => readEnv({}, false)).toThrow(/missing/);
    expect(() => readEnv({ apiUrl: 'http://api.thrivecbt.app/v1' }, false)).toThrow(/https/);
    expect(readEnv({ apiUrl: 'https://api.thrivecbt.app/v1' }, false).apiUrl).toBe(
      'https://api.thrivecbt.app/v1'
    );
  });
});
