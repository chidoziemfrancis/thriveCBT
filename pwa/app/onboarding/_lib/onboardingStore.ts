const STORAGE_KEY = "onboarding";

type OnboardingData = {
  name?: string;
  dateOfBirth?: string;
  isUndergraduate?: boolean;
};

function read(): OnboardingData {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getOnboardingData(): OnboardingData {
  return read();
}

export function setOnboardingData(patch: Partial<OnboardingData>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...read(), ...patch }));
}
