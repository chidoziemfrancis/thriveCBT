import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/icons';
import FeatureIcon from '@/components/icons/FeatureIcon';
import Button from '@/components/ui/Button';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

/**
 * Home after the last session: the final check-in until it's taken, then a quiet link to the
 * certificate.
 */
export default function EndOfStudyCard({ state }: { state: 'due' | 'done' }) {
  if (state === 'done') {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          haptics.tap();
          router.push('/end-of-study/certificate');
        }}
        style={({ pressed }) => [styles.done, pressed && { opacity: 0.8 }]}
      >
        <FeatureIcon name="trophy" size={40} />
        <View style={styles.text}>
          <Text style={styles.title}>You finished ThriveCBT</Text>
          <Text style={styles.meta}>See your certificate</Text>
        </View>
        <ChevronRightIcon size={16} color={colors.inkFaint} />
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <FeatureIcon name="document" size={40} />
        <View style={styles.text}>
          <Text style={styles.title}>One last check-in</Text>
          <Text style={styles.meta}>The same 9 questions as at the start. About 2 minutes.</Text>
        </View>
      </View>
      <Button onPress={() => router.push('/end-of-study')}>Start</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  done: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  text: { flex: 1, gap: 3 },
  title: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
});
