import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import { CloseIcon, InfoIcon } from '@/components/icons';
import {
  dismissEmergencyContactCard,
  useEmergencyContact,
} from '@/features/profile/emergencyContactStore';
import { colors, fonts, radius } from '@/theme';

const AMBER = '#C47A0A';
const AMBER_SOFT = '#FFF4DC';
const AMBER_BORDER = '#F2D38A';

/** A gentle nudge until a contact is added; dismissible because adding one is optional. */
export default function EmergencyContactCard() {
  const { contact, cardDismissed } = useEmergencyContact();
  if (contact || cardDismissed) return null;

  return (
    <Animated.View exiting={FadeOut} style={styles.card}>
      <View style={styles.top}>
        <InfoIcon color={AMBER} />
        <View style={styles.text}>
          <Text style={styles.title}>Add an emergency contact</Text>
          <Text style={styles.body}>
            So we can reach someone if you ever need urgent help. Takes about 30 seconds.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Not now"
          onPress={dismissEmergencyContactCard}
          hitSlop={10}
        >
          <CloseIcon color={colors.inkFaint} />
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/profile/emergency-contact')}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.buttonText}>Add now</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: AMBER_BORDER,
    backgroundColor: AMBER_SOFT,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  text: { flex: 1, gap: 4 },
  title: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  body: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  button: {
    height: 50,
    borderRadius: radius.md,
    backgroundColor: '#B45F06',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontFamily: fonts.heavy, fontSize: 16, color: colors.onPrimary },
});
