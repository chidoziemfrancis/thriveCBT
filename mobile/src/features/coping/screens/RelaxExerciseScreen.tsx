import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { EXERCISES } from '@/features/coping/utils/coping';
import HelpedChoice from '@/features/coping/components/HelpedChoice';
import RelaxPlayer from '@/features/coping/components/RelaxPlayer';
import { logToolUse } from '@/features/coping/store/copingStore';
import { colors, fonts, type } from '@/theme';

export default function RelaxExerciseScreen() {
  const { exercise } = useLocalSearchParams<{ exercise: string }>();
  const found = EXERCISES.find((e) => e.id === exercise);
  const [done, setDone] = useState(false);
  const [rated, setRated] = useState(false);
  if (!found) return <Redirect href="/relax" />;

  return (
    <Screen>
      <BackButton />
      <View style={styles.header}>
        <Text style={[type.title, styles.center]}>{found.title}</Text>
        <Text style={[styles.meta, styles.center]}>{found.detail}</Text>
      </View>
      <View style={styles.player}>
        <RelaxPlayer exercise={found.id} done={done} onDone={() => setDone(true)} />
      </View>
      {done && !rated && (
        <Animated.View entering={FadeIn.duration(300)}>
          <HelpedChoice
            onPick={(helped) => {
              logToolUse(found.id, helped);
              setRated(true);
            }}
          />
        </Animated.View>
      )}
      {rated && (
        <Animated.Text entering={FadeIn.duration(300)} style={[styles.meta, styles.center]}>
          Thanks. Your toolkit remembers what works for you.
        </Animated.Text>
      )}
      {rated && (
        <Button variant="ghost" onPress={() => router.back()}>
          Done
        </Button>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, marginTop: 16 },
  center: { textAlign: 'center' },
  meta: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  player: { marginVertical: 28 },
});
