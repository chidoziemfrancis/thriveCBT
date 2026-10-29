import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const HEARTBEAT_GAP_MS = 140;

// Haptics are unavailable on web, and a missing motor should never break a flow.
function run(effect: () => Promise<void>) {
  if (Platform.OS === 'web') return;
  effect().catch(() => {});
}

export const haptics = {
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  tick: () => run(() => Haptics.selectionAsync()),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

  heartbeat() {
    run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft));
    setTimeout(
      () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
      HEARTBEAT_GAP_MS
    );
  },

  // Fires one soft tap per delay so the feel lines up with staggered entrance animations.
  ripple(delaysMs: number[]) {
    const timers = delaysMs.map((delay) =>
      setTimeout(() => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)), delay)
    );
    return () => timers.forEach(clearTimeout);
  },
};
