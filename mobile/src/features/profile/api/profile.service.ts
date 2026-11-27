import { api } from '@/lib/axios';

import type {
  PreferencesUpdate,
  Profile,
  ProfileUpdate,
  ServerPreferences,
} from '../types/profile.types';

export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
  preferences: () => [...profileKeys.all, 'preferences'] as const,
};

export const profileService = {
  getProfile: () => api.get<Profile>('/me/profile').then((r) => r.data),
  updateProfile: (body: ProfileUpdate) =>
    api.patch<Profile>('/me/profile', body).then((r) => r.data),
  getPreferences: () => api.get<ServerPreferences>('/me/preferences').then((r) => r.data),
  updatePreferences: (body: PreferencesUpdate) =>
    api.patch<ServerPreferences>('/me/preferences', body).then((r) => r.data),
};
