import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Icon3D from '@/components/icons/Icon3D';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import TextField from '@/components/ui/TextField';
import { firstName } from '@/features/assignment/assign';
import { getAssignment } from '@/features/assignment/assignmentStore';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { formatDuration } from '@/features/checkin/checkinLogic';
import { completeCheckIn, getNextCheckIn } from '@/features/checkin/checkinStore';
import MoodFace from '@/features/mood/components/MoodFace';
import { MOODS } from '@/features/mood/moods';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

export default function CallFeedbackScreen() {
  const { seconds: secondsParam = '0' } = useLocalSearchParams<{ seconds?: string }>();
  const seconds = Number(secondsParam) || 0;
  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [researcher] = useState(() =>
    MOCK_RESEARCHERS.find((r) => r.id === getAssignment()?.researcherId)
  );

  function finish(withRating: number | null) {
    const checkIn = getNextCheckIn(researcher?.id);
    if (checkIn) {
      completeCheckIn(checkIn, {
        rating: withRating,
        note: note.trim() || undefined,
        callSeconds: seconds,
      });
    }
    if (withRating !== null) haptics.success();
    router.replace('/dashboard');
  }

  const name = researcher ? firstName(researcher.name) : 'your researcher';

  return (
    <Screen
      footer={
        <>
          <Button disabled={rating === null} onPress={() => finish(rating)}>
            Done
          </Button>
          <Button variant="ghost" onPress={() => finish(null)}>
            Skip
          </Button>
        </>
      }
    >
      <View style={styles.body}>
        <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
          <Icon3D name="heart" size={72} />
          <Text style={type.eyebrow}>Call ended · {formatDuration(seconds)}</Text>
          <Text style={[type.title, styles.center]}>How did that feel?</Text>
          <Text style={[type.body, styles.center]}>
            Only you and the research team see this. It helps {name} support you better.
          </Text>
        </Animated.View>

        <View style={styles.faces} accessibilityRole="radiogroup">
          {MOODS.map((mood, index) => {
            const selected = rating === index;
            return (
              <Pressable
                key={mood.label}
                accessibilityRole="radio"
                accessibilityLabel={mood.label}
                accessibilityState={{ selected }}
                onPress={() => {
                  haptics.tick();
                  setRating(index);
                }}
                style={({ pressed }) => [
                  styles.face,
                  selected && { borderColor: mood.color, backgroundColor: colors.surface },
                  pressed && { transform: [{ scale: 0.94 }] },
                ]}
              >
                <View style={{ opacity: rating === null || selected ? 1 : 0.45 }}>
                  <MoodFace mood={index} size={selected ? 40 : 34} />
                </View>
                <Text style={[styles.faceLabel, selected && { color: colors.ink }]}>
                  {mood.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <TextField
          label="Anything you want to add? (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="What helped, or what could be better"
          multiline
          style={styles.note}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 24 },
  header: { alignItems: 'center', gap: 8 },
  center: { textAlign: 'center' },
  faces: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  face: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  faceLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkMuted },
  note: { height: 100, paddingTop: 14, textAlignVertical: 'top' },
});
