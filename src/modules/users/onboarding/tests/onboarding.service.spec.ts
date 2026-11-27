import type { ConsentService } from '../../../consent/services/consent.service.js';
import type { AccountsService } from '../../accounts/services/accounts.service.js';
import type { StudentsService } from '../../students/services/students.service.js';
import {
  nextOnboardingStep,
  OnboardingService,
} from '../services/onboarding.service.js';

const done = {
  emailVerified: true,
  consented: true,
  profileComplete: true,
  isUndergraduate: true,
};

describe('nextOnboardingStep', () => {
  it.each([
    [{ ...done, emailVerified: false, consented: false }, 'verify-email'],
    [{ ...done, consented: false }, 'consent'],
    [{ ...done, profileComplete: false }, 'profile'],
    [{ ...done, isUndergraduate: null }, 'eligibility'],
    [{ ...done, isUndergraduate: false }, 'not-eligible'],
    [done, 'done'],
  ] as const)('%o → %s', (state, step) => {
    expect(nextOnboardingStep(state)).toBe(step);
  });
});

describe('OnboardingService', () => {
  it('works the step out from what the student has saved', async () => {
    const accounts = {
      getById: vi.fn(async () => ({ emailVerifiedAt: new Date() })),
    };
    const students = {
      getProfile: vi.fn(async () => ({
        name: 'Ada',
        dateOfBirth: null,
        isUndergraduate: null,
      })),
    };
    const consent = { latestFor: vi.fn(async () => ({ version: 'v1' })) };
    const service = new OnboardingService(
      accounts as unknown as AccountsService,
      students as unknown as StudentsService,
      consent as unknown as ConsentService,
    );
    await expect(service.status('u1')).resolves.toEqual({
      nextStep: 'profile',
      emailVerified: true,
      consented: true,
      profileComplete: false,
      isUndergraduate: null,
    });
  });
});
