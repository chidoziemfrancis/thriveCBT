import { chooseAvatar } from '@/features/avatar/avatarStore';
import { setOnboardingData } from '@/features/onboarding/onboardingStore';
import { setPreference } from '@/lib/preferences';

import type { Profile, ServerPreferences } from '../types/profile.types';

// The server owns these. Screens across the app still read the phone's copy, which keeps the
// app working offline, so it is only ever written from server responses.
export function saveProfileOnPhone(profile: Profile) {
  setOnboardingData({
    name: profile.name ?? undefined,
    dateOfBirth: profile.dateOfBirth ?? undefined,
    isUndergraduate: profile.isUndergraduate ?? undefined,
    startedAt: profile.startedAt ?? undefined,
  });
  if (profile.avatarId) chooseAvatar(profile.avatarId);
}

export function savePreferencesOnPhone(preferences: ServerPreferences) {
  for (const [key, value] of Object.entries(preferences) as [keyof ServerPreferences, never][]) {
    setPreference(key, value);
  }
}
