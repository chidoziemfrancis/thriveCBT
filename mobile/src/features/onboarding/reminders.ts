import * as Notifications from 'expo-notifications';

import { getPreferences, setPreference } from '@/lib/preferences';

export function afterMatching() {
  return getPreferences().remindersAsked ? '/auth/create-pin' : '/onboarding/reminders';
}

/** Asks the phone once; the answer is the phone's to keep, so the app only remembers it asked. */
export async function askForReminders(): Promise<boolean> {
  setPreference('remindersAsked', true);
  try {
    const { granted } = await Notifications.requestPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}

export function skipReminders() {
  setPreference('remindersAsked', true);
}

export async function remindersAllowed(): Promise<boolean> {
  try {
    return (await Notifications.getPermissionsAsync()).granted;
  } catch {
    return false;
  }
}
