import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { usePlannedActivities } from '@/features/activities/activityStore';
import { usePositiveLog } from '@/features/beliefs/positiveLogStore';
import { useStressLog, useToolkit } from '@/features/coping/copingStore';
import { getMoodLog } from '@/features/mood/moodStore';
import type { JourneyStep } from '@/features/sessions/content/types';
import { useSessionProgress } from '@/features/sessions/progressStore';
import { useThoughtLog } from '@/features/thoughts/thoughtLogStore';
import { journeyLines } from '@/features/wellbeing/wellbeing';
import { colors, fonts } from '@/theme';

import { stepText } from './stepText';

/** The eight weeks, one row each, told with what the student actually did. */
export default function JourneyStepView({ step }: { step: JourneyStep }) {
  const belief = useSessionProgress()[7]?.answers?.['new-belief'];
  const lines = journeyLines({
    moods: getMoodLog(),
    thoughts: useThoughtLog(),
    plans: usePlannedActivities(),
    toolkit: useToolkit(),
    stress: useStressLog(),
    evidence: usePositiveLog(),
    newBelief: typeof belief === 'string' && belief.trim() ? belief.trim() : undefined,
  });

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
      </View>
      <View>
        {lines.map((l, i) => (
          <Animated.View
            key={l.week}
            entering={FadeInDown.delay(120 * i).duration(350)}
            style={styles.row}
          >
            <View style={styles.rail}>
              <View style={[styles.badge, l.week === lines.length && styles.badgeNow]}>
                <Text style={[styles.badgeText, l.week === lines.length && styles.badgeTextNow]}>
                  {l.week}
                </Text>
              </View>
              {i < lines.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.text}>
              <Text style={styles.title}>{l.title}</Text>
              <Text style={styles.body}>{l.line}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 20, paddingTop: 8 },
  row: { flexDirection: 'row', gap: 14 },
  rail: { alignItems: 'center', width: 28 },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNow: { backgroundColor: colors.primary },
  badgeText: { fontFamily: fonts.heavy, fontSize: 13, color: colors.primary },
  badgeTextNow: { color: colors.onPrimary },
  line: { flex: 1, width: 2, marginVertical: 4, backgroundColor: colors.primarySoft },
  text: { flex: 1, gap: 2, paddingBottom: 18 },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
});
