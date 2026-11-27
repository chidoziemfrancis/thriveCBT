import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/lib/storage', () => {
  const memory = new Map<string, unknown>();
  return {
    memory,
    readJson: (key: string, fallback: unknown) => (memory.has(key) ? memory.get(key) : fallback),
    writeJson: (key: string, value: unknown) => memory.set(key, value),
    removeKey: (key: string) => memory.delete(key),
  };
});
jest.mock('expo-crypto', () => ({ randomUUID: () => 'id' }));
jest.mock('expo-secure-store', () => ({ getItemAsync: async () => null }));
jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: {
    getItemSync: () => null,
    setItemSync: () => undefined,
    removeItemSync: () => undefined,
  },
}));

const mockGet = jest.fn<(url: string) => Promise<{ data: unknown }>>();
jest.mock('@/lib/axios', () => ({ api: { get: (url: string) => mockGet(url) } }));

import { getConsent } from '@/features/consent/consentStore';
import { getOnboardingData } from '@/features/onboarding/onboardingStore';
import { pullStudentToPhone, resumeRoute, routeForStep } from '@/features/onboarding/resume';
import { getPreferences } from '@/lib/preferences';
import { queryClient } from '@/lib/query-client';

const mockMemory = (jest.requireMock('@/lib/storage') as { memory: Map<string, unknown> }).memory;

beforeEach(() => {
  mockMemory.clear();
  mockGet.mockReset();
  queryClient.clear();
});

describe('routeForStep', () => {
  it('sends each onboarding step to its screen', () => {
    expect(routeForStep('verify-email')).toBe('/auth/verify-email');
    expect(routeForStep('consent')).toBe('/consent/study-info');
    expect(routeForStep('profile')).toBe('/onboarding/name');
    expect(routeForStep('eligibility')).toBe('/onboarding/eligibility');
    expect(routeForStep('not-eligible')).toBe('/onboarding/not-eligible');
    expect(routeForStep('done')).toBeNull();
  });
});

describe('resumeRoute', () => {
  it('asks the server where the student stopped', async () => {
    mockGet.mockResolvedValue({ data: { nextStep: 'consent' } });
    await expect(resumeRoute()).resolves.toBe('/consent/study-info');
    expect(mockGet).toHaveBeenCalledWith('/me/onboarding');
  });

  it('gives no route when the phone is offline', async () => {
    mockGet.mockRejectedValue(new Error('Network Error'));
    await expect(resumeRoute()).resolves.toBeNull();
  });
});

describe('pullStudentToPhone', () => {
  it('copies the profile, settings and consent from the server to the phone', async () => {
    mockGet.mockImplementation(async (url) => {
      if (url === '/me/profile') {
        return {
          data: { name: 'Kemi', dateOfBirth: '2005-02-11', isUndergraduate: true, avatarId: null },
        };
      }
      if (url === '/me/preferences') {
        return {
          data: {
            notifySessions: true,
            notifyMood: false,
            moodReminderTime: '08:00',
            notifyMessages: true,
            notifyCheckIns: true,
          },
        };
      }
      return { data: { version: 'draft-2026-11-03', agreedAt: '2026-11-27T07:12:01.270Z' } };
    });

    await pullStudentToPhone();

    expect(getOnboardingData()).toEqual({
      name: 'Kemi',
      dateOfBirth: '2005-02-11',
      isUndergraduate: true,
    });
    expect(getPreferences()).toMatchObject({ notifyMood: false, moodReminderTime: '08:00' });
    expect(getConsent()).toEqual({
      version: 'draft-2026-11-03',
      agreedAt: '2026-11-27T07:12:01.270Z',
    });
  });

  it('keeps what is on the phone when the server can’t be reached', async () => {
    mockMemory.set('onboarding', { name: 'Kemi' });
    mockGet.mockRejectedValue(new Error('Network Error'));
    await pullStudentToPhone();
    expect(getOnboardingData()).toEqual({ name: 'Kemi' });
  });
});
