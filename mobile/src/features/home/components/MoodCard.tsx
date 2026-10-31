import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import Button from '@/components/ui/Button';
import MoodFace from '@/features/mood/components/MoodFace';
import MoodGauge from '@/features/mood/components/MoodGauge';
import type { MoodEntry } from '@/features/mood/moodLog';
import { MOODS } from '@/features/mood/moods';
import { colors, fonts, radius } from '@/theme';

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function MoodCard({
  today,
  onLog,
}: {
  today: MoodEntry | null;
  onLog: (mood: number) => void;
}) {
  const [editing, setEditing] = useState(today === null);
  const [choice, setChoice] = useState<number | null>(today?.mood ?? null);

  if (today && !editing) {
    const mood = MOODS[today.mood];
    return (
      <Animated.View entering={FadeIn} style={[styles.card, styles.logged]}>
        <MoodFace mood={today.mood} size={44} />
        <View style={styles.loggedText}>
          <Text style={styles.title}>Feeling {mood.label.toLowerCase()} today</Text>
          <Text style={styles.meta}>Logged at {timeOf(today.at)}. Thanks for checking in.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change today's mood"
          onPress={() => setEditing(true)}
          hitSlop={8}
        >
          <Text style={styles.change}>Change</Text>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>How are you feeling today?</Text>
      <MoodGauge value={choice} onChange={setChoice} />
      <Button
        disabled={choice === null}
        onPress={() => {
          if (choice === null) return;
          onLog(choice);
          setEditing(false);
        }}
      >
        Log my mood
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  logged: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  loggedText: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.inkMuted },
  change: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
});
