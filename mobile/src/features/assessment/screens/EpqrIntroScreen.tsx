import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import Mascot from '@/components/mascot/Mascot';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { EPQR_ITEMS } from '../utils/epqr';
import { getEpqrAnswers } from '../store/epqrStore';
import { colors, fonts, type } from '@/theme';

/** Sets up the 100 yes/no questions, or offers to carry on from where the student stopped. */
export default function EpqrIntroScreen() {
  const [answered] = useState(() => getEpqrAnswers().filter((a) => a !== undefined).length);

  return (
    <Screen
      footer={
        <Button onPress={() => router.push('/assessment/epqr/questions')}>
          {answered > 0 ? `Carry on from question ${answered + 1}` : 'Start'}
        </Button>
      }
    >
      <View style={styles.body}>
        <Animated.View entering={FadeInUp.duration(500)} style={styles.center}>
          <Mascot size={104} mood="calm" />
        </Animated.View>
        <View style={styles.copy}>
          <Text style={type.eyebrow}>One more part</Text>
          <Text style={type.title}>A few questions about you</Text>
          <Text style={type.body}>
            {EPQR_ITEMS.length} quick questions about how you usually are. Just answer Yes or No.
          </Text>
        </View>
        <View style={styles.points}>
          {[
            'There are no right or wrong answers.',
            'Go with your first answer. Don’t think too long.',
            'It takes about 10 minutes, with short breaks.',
            'Only the research team sees your answers.',
          ].map((point) => (
            <View key={point} style={styles.point}>
              <View style={styles.dot} />
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: 24, paddingTop: 24 },
  center: { alignItems: 'center' },
  copy: { gap: 8 },
  points: { gap: 12 },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dot: { width: 8, height: 8, marginTop: 8, borderRadius: 4, backgroundColor: colors.primary },
  pointText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink },
});
