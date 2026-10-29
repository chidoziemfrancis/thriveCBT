import { readJson, writeJson } from '@/lib/storage';

const STORAGE_KEY = 'onboarding';

type OnboardingData = {
  name?: string;
  dateOfBirth?: string;
  isUndergraduate?: boolean;
};

export function getOnboardingData(): OnboardingData {
  return readJson<OnboardingData>(STORAGE_KEY, {});
}

export function setOnboardingData(patch: Partial<OnboardingData>) {
  writeJson(STORAGE_KEY, { ...getOnboardingData(), ...patch });
}
