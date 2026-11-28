import { readJson, removeKey, writeJson } from '@/lib/storage';
import { onStudentChange } from '@/lib/sync';

const STORAGE_KEY = 'onboarding';

type OnboardingData = {
  name?: string;
  dateOfBirth?: string;
  isUndergraduate?: boolean;
  /** When the study started: the first consent, from the server. */
  startedAt?: string;
};

export function getOnboardingData(): OnboardingData {
  return readJson<OnboardingData>(STORAGE_KEY, {});
}

export function setOnboardingData(patch: Partial<OnboardingData>) {
  writeJson(STORAGE_KEY, { ...getOnboardingData(), ...patch });
}

onStudentChange(() => removeKey(STORAGE_KEY));
