import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import MoodFace from '@/features/mood/components/MoodFace';
import type { MoodEntry } from '@/features/mood/moodLog';
import { MOODS } from '@/features/mood/moods';
import { colors, fonts } from '@/theme';

const FACE = 54;

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** One tap logs today's mood; tapping another face changes it. */
export default function DailyMood({
  today,
  onLog,
}: {
  today: MoodEntry | null;
  onLog: (mood: number) => void;
}) {
  const chosen = today?.mood ?? null;

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <Text style={styles.title}>Daily mood</Text>
        {today && <Text style={styles.meta}>Logged {timeOf(today.at)}</Text>}
      </View>

      <View style={styles.row} accessibilityRole="radiogroup">
        {MOODS.map((mood, i) => {
          const selected = chosen === i;
          return (
            <Pressable
              key={mood.label}
              accessibilityRole="radio"
              accessibilityLabel={mood.label}
              accessibilityState={{ selected }}
              onPress={() => {
                if (!selected) onLog(i);
              }}
              style={({ pressed }) => [
                styles.option,
                chosen !== null && !selected && styles.faded,
                selected && styles.selected,
                pressed && { transform: [{ scale: 0.92 }] },
              ]}
            >
              <View style={[styles.ring, selected && { borderColor: mood.color }]}>
                <MoodFace mood={i} size={FACE} />
              </View>
            </Pressable>
          );
        })}
      </View>

      <Animated.Text key={chosen ?? 'none'} entering={FadeIn.duration(250)} style={styles.caption}>
        {chosen === null
          ? 'Tap the face that fits how you feel right now.'
          : `Feeling ${MOODS[chosen].label.toLowerCase()} today. Thanks for checking in.`}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 14 },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkFaint },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  option: { alignItems: 'center' },
  faded: { opacity: 0.4 },
  selected: { transform: [{ scale: 1.1 }] },
  ring: { padding: 3, borderRadius: FACE, borderWidth: 3, borderColor: 'transparent' },
  caption: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
});
