import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import { ChevronRightIcon, CloseIcon } from '@/components/icons';
import { Glyph } from '@/components/icons/FeatureIcon';
import {
  dismissEmergencyContactCard,
  useEmergencyContact,
} from '@/features/profile/emergencyContactStore';
import { colors, fonts, radius } from '@/theme';

/** A gentle nudge until a contact is added; dismissible because adding one is optional. */
export default function EmergencyContactCard() {
  const { contact, cardDismissed } = useEmergencyContact();
  if (contact || cardDismissed) return null;

  return (
    <Animated.View exiting={FadeOut} style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityHint="So we can reach someone if you ever need urgent help"
        onPress={() => router.push('/profile/emergency-contact')}
        style={({ pressed }) => [styles.main, pressed && { opacity: 0.7 }]}
      >
        <Glyph name="shield" size={22} color={colors.butterInk} />
        <View style={styles.text}>
          <Text style={styles.title}>Add an emergency contact</Text>
          <Text style={styles.body}>Takes about 30 seconds</Text>
        </View>
        <ChevronRightIcon color={colors.butterInk} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Not now"
        onPress={dismissEmergencyContactCard}
        hitSlop={10}
        style={styles.close}
      >
        <CloseIcon size={14} color={colors.inkFaint} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 8,
    borderRadius: radius.md,
    backgroundColor: colors.butter,
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  text: { flex: 1, gap: 1 },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  body: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted },
  close: { padding: 8, marginLeft: 4 },
});
