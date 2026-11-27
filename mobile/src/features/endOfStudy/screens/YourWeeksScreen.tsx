import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import Mascot from '@/components/mascot/Mascot';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { getCheckInHistory } from '@/features/checkin/checkinStore';
import { allPracticeDays, sessionsFinished } from '@/features/endOfStudy/endOfStudy';
import { usePracticeData } from '@/features/homework/usePracticeData';
import { useSessionProgress } from '@/features/sessions/store/progressStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

/** The effort recap, shown before any score so the work counts whatever the score did. */
export default function YourWeeksScreen() {
  const progress = useSessionProgress();
  const practice = usePracticeData();
  const [checkIns] = useState(() => getCheckInHistory().length);

  useEffect(() => {
    const timer = setTimeout(haptics.heartbeat, 300);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { value: sessionsFinished(progress), label: 'sessions finished' },
    { value: practice.thoughts.length, label: 'thoughts you caught and looked at again' },
    { value: allPracticeDays(practice), label: 'days you practised' },
    { value: checkIns, label: 'check-ins with your researcher' },
  ];

  return (
    <Screen footer={<Button onPress={() => router.push('/end-of-study/compare')}>Continue</Button>}>
      <View style={styles.body}>
        <Animated.View entering={FadeInUp.duration(500)} style={styles.center}>
          <Mascot size={96} mood="cheer" />
        </Animated.View>
        <View style={styles.copy}>
          <Text style={[type.eyebrow, styles.green, styles.centerText]}>Your 8 weeks</Text>
          <Text style={[type.title, styles.centerText]}>Look what you put in</Text>
        </View>
        <View>
          {stats.map((stat, i) => (
            <Animated.View
              key={stat.label}
              entering={FadeInDown.delay(150 + i * 90).duration(380)}
              style={[styles.row, i > 0 && styles.divider]}
              accessible
              accessibilityLabel={`${stat.value} ${stat.label}`}
            >
              <Text style={styles.value}>{stat.value}</Text>
              <Text style={styles.label}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 22, paddingTop: 24 },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  green: { color: colors.primary },
  copy: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 14, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  value: {
    minWidth: 52,
    fontFamily: fonts.heavy,
    fontSize: 30,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  label: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 21,
    color: colors.inkMuted,
  },
});
