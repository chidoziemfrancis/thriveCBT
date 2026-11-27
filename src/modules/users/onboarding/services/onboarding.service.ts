import { Injectable } from '@nestjs/common';

import { ConsentService } from '../../../consent/services/consent.service.js';
import { AccountsService } from '../../accounts/services/accounts.service.js';
import { StudentsService } from '../../students/services/students.service.js';
import type { OnboardingDto, OnboardingStep } from '../dto/onboarding.dto.js';

type OnboardingState = Omit<OnboardingDto, 'nextStep'>;

// The same order as the app's screens. B3 adds phq9, epqr and assignment before "done".
export function nextOnboardingStep(state: OnboardingState): OnboardingStep {
  if (!state.emailVerified) return 'verify-email';
  if (!state.consented) return 'consent';
  if (!state.profileComplete) return 'profile';
  if (state.isUndergraduate === null) return 'eligibility';
  if (!state.isUndergraduate) return 'not-eligible';
  return 'done';
}

@Injectable()
export class OnboardingService {
  constructor(
    private readonly accounts: AccountsService,
    private readonly students: StudentsService,
    private readonly consent: ConsentService,
  ) {}

  async status(userId: string): Promise<OnboardingDto> {
    const [user, profile, consent] = await Promise.all([
      this.accounts.getById(userId),
      this.students.getProfile(userId),
      this.consent.latestFor(userId),
    ]);
    const state: OnboardingState = {
      emailVerified: user.emailVerifiedAt !== null,
      consented: consent !== null,
      profileComplete: Boolean(profile.name && profile.dateOfBirth),
      isUndergraduate: profile.isUndergraduate,
    };
    return { nextStep: nextOnboardingStep(state), ...state };
  }
}
