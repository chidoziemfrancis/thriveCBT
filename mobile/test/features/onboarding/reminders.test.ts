import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockRequest = jest.fn<() => Promise<{ granted: boolean }>>();
jest.mock('expo-notifications', () => ({ requestPermissionsAsync: () => mockRequest() }));
jest.mock('@/lib/storage', () => ({
  readJson: (_key: string, fallback: unknown) => fallback,
  writeJson: () => undefined,
  removeKey: () => undefined,
}));

import { afterMatching, askForReminders, skipReminders } from '@/features/onboarding/reminders';
import { setPreference } from '@/lib/preferences';

beforeEach(() => {
  mockRequest.mockReset();
  setPreference('remindersAsked', false);
});

describe('reminders', () => {
  it('shows the reminders screen once, before the PIN', () => {
    expect(afterMatching()).toBe('/onboarding/reminders');
    skipReminders();
    expect(afterMatching()).toBe('/auth/create-pin');
  });

  it('asks the phone and reports what it said', async () => {
    mockRequest.mockResolvedValue({ granted: true });
    await expect(askForReminders()).resolves.toBe(true);
    expect(afterMatching()).toBe('/auth/create-pin');
  });

  it('carries on without reminders if the phone refuses or errors', async () => {
    mockRequest.mockRejectedValue(new Error('unavailable'));
    await expect(askForReminders()).resolves.toBe(false);
    expect(afterMatching()).toBe('/auth/create-pin');
  });
});
