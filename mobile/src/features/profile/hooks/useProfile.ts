import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api-error';

import { profileKeys, profileService } from '../api/profile.service';
import { saveProfileOnPhone } from '../phoneCopy';
import type { Profile, ProfileUpdate } from '../types/profile.types';

const onboardingStatusKey = ['onboarding', 'status'] as const;

export function useProfile() {
  return useQuery<Profile, ApiError>({
    queryKey: profileKeys.detail(),
    queryFn: profileService.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<Profile, ApiError, ProfileUpdate>({
    mutationFn: profileService.updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.detail(), profile);
      void queryClient.invalidateQueries({ queryKey: onboardingStatusKey });
      saveProfileOnPhone(profile);
    },
  });
}
