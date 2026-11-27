import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api-error';
import { haptics } from '@/lib/haptics';
import { getPreferences, type Preferences, setPreference } from '@/lib/preferences';

import { profileKeys, profileService } from '../api/profile.service';
import { savePreferencesOnPhone } from '../store/phoneCopy';
import type { PreferencesUpdate, ServerPreferences } from '../types/profile.types';

type SettingKey = keyof ServerPreferences & keyof Preferences;

/**
 * Notification switches change at once on the phone, then save to the server. If the save
 * fails, the switch goes back to how it was.
 */
export function useSaveSetting() {
  const queryClient = useQueryClient();
  const mutation = useMutation<ServerPreferences, ApiError, PreferencesUpdate>({
    mutationFn: profileService.updatePreferences,
    onSuccess: (preferences) => {
      queryClient.setQueryData(profileKeys.preferences(), preferences);
      savePreferencesOnPhone(preferences);
    },
  });

  function saveSetting<K extends SettingKey>(key: K, value: Preferences[K]) {
    const previous = getPreferences()[key];
    setPreference(key, value);
    mutation.mutate({ [key]: value } as PreferencesUpdate, {
      onError: () => {
        setPreference(key, previous);
        haptics.error();
      },
    });
  }

  return { saveSetting, error: mutation.error };
}
