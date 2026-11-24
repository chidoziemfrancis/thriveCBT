import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import Mascot from '@/components/mascot/Mascot';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { startPhq9 } from '@/features/assessment/assessmentStore';
import { PHQ9_QUESTIONS } from '@/features/assessment/phq9';
import { colors, fonts, type } from '@/theme';

const POINTS = [
  'There are no right or wrong answers.',
  'Afterwards you’ll see how things compare with when you started.',
  'Only the research team sees your answers.',
];

/** S39: the same PHQ-9 as at sign-up, taken once more at the end of week 8. */
export default function FinalCheckInScreen() {
  function start() {
    startPhq9('final');
    router.push('/assessment/phq9/1');
  }

  return (
    <Screen footer={<Button onPress={start}>Start</Button>}>
      <BackButton />
      <View style={styles.body}>
        <Animated.View entering={FadeInUp.duration(500)} style={styles.center}>
          <Mascot size={104} mood="calm" />
        </Animated.View>
        <View style={styles.copy}>
          <Text style={type.eyebrow}>Week 8</Text>
          <Text style={type.title}>One last check-in</Text>
          <Text style={type.body}>
            These are the same {PHQ9_QUESTIONS.length} questions you answered at the start. Think
            about the last 2 weeks.
          </Text>
        </View>
        <View>
          {POINTS.map((point, i) => (
            <View key={point} style={[styles.row, i > 0 && styles.divider]}>
              <View style={styles.dot} />
              <Text style={styles.rowText}>{point}</Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 24, paddingTop: 12 },
  center: { alignItems: 'center' },
  copy: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  dot: { width: 8, height: 8, marginTop: 7, borderRadius: 4, backgroundColor: colors.primary },
  rowText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink },
});
