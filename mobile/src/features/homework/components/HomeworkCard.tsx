import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon, ChevronRightIcon } from '@/components/icons';
import { dayKey } from '@/features/activities/utils/activities';
import { AUTO_TICK, practiceDays } from '@/features/homework/homework';
import { toggleTick } from '@/features/homework/homeworkStore';
import { usePracticeData } from '@/features/homework/usePracticeData';
import { sessionContent } from '@/features/sessions/content';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import PracticeWeek from './PracticeWeek';

/** This week's practice on Home: what to do, the days done, and a tick for today. */
export default function HomeworkCard({ sessionId }: { sessionId: number }) {
  const data = usePracticeData();
  const content = sessionContent(sessionId);
  if (!content) return null;
  const done = practiceDays(sessionId, data);
  const today = dayKey(new Date());
  const ticked = (data.ticks[sessionId] ?? []).includes(today);

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="See all your practice"
        onPress={() => {
          haptics.tick();
          router.push('/homework');
        }}
        style={styles.head}
      >
        <Text style={styles.heading}>This week’s practice</Text>
        <ChevronRightIcon size={16} color={colors.inkFaint} />
      </Pressable>
      <Text style={styles.practice}>{content.practice}</Text>
      <PracticeWeek done={done} />
      <View style={styles.foot}>
        <Text style={styles.auto}>{AUTO_TICK[sessionId] ?? 'Tick each day you do it.'}</Text>
        {!done.has(today) || ticked ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ checked: ticked }}
            onPress={() => {
              haptics.tap();
              toggleTick(sessionId);
            }}
            style={[styles.tick, ticked && styles.tickOn]}
          >
            {ticked && <CheckIcon size={12} color={colors.onPrimary} />}
            <Text style={[styles.tickText, ticked && styles.tickTextOn]}>
              {ticked ? 'Done today' : 'I did it today'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  practice: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  auto: { flex: 1, fontFamily: fonts.medium, fontSize: 12, lineHeight: 17, color: colors.inkFaint },
  tick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  tickOn: { backgroundColor: colors.primary },
  tickText: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
  tickTextOn: { color: colors.onPrimary },
});
