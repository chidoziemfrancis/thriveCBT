import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import Button from '@/components/ui/Button';
import FeatureIcon from '@/components/icons/FeatureIcon';
import type { FeatureIconName, FeatureIconTone } from '@/components/icons/FeatureIcon';
import Screen from '@/components/ui/Screen';
import StepHeader from '@/components/ui/StepHeader';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const JOURNEY: { title: string; detail: string; icon: FeatureIconName; tone: FeatureIconTone }[] = [
  {
    title: 'Quick check-in',
    detail: '9 questions about the last 2 weeks',
    icon: 'document',
    tone: 'lavender',
  },
  {
    title: '8 weekly sessions',
    detail: 'Short lessons, a mood check and a journal',
    icon: 'book',
    tone: 'mint',
  },
  {
    title: 'Weekly video check-ins',
    detail: 'A real researcher, right in the app',
    icon: 'video',
    tone: 'peach',
  },
  {
    title: 'Final check-in',
    detail: 'See how far you’ve come',
    icon: 'flag',
    tone: 'butter',
  },
];

const entranceDelay = (index: number) => 100 + index * 90;

export default function WhatToExpectScreen() {
  useEffect(() => haptics.ripple(JOURNEY.map((_, index) => entranceDelay(index))), []);

  return (
    <Screen
      footer={<Button onPress={() => router.push('/assessment/phq9/1')}>Start my check-in</Button>}
    >
      <StepHeader step={4} totalSteps={4} />

      <View style={styles.body}>
        <View style={styles.copy}>
          <Text style={type.title}>Here’s your journey</Text>
          <Text style={type.body}>About 35–50 minutes a week. Go at your own pace.</Text>
        </View>

        <View>
          {JOURNEY.map(({ title, detail, icon, tone }, index) => {
            const isLast = index === JOURNEY.length - 1;
            return (
              <Animated.View
                key={title}
                entering={FadeInRight.delay(entranceDelay(index)).duration(400)}
                style={styles.item}
              >
                <View style={styles.rail}>
                  <FeatureIcon name={icon} size={56} tone={tone} />
                  {!isLast && <View style={styles.line} />}
                </View>
                <View style={[styles.itemText, !isLast && { paddingBottom: 28 }]}>
                  <Text style={styles.itemTitle}>{title}</Text>
                  <Text style={type.caption}>{detail}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            You can pause anytime, and help is always one tap away if things feel heavy.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: 24, gap: 28 },
  copy: { gap: 8 },
  item: { flexDirection: 'row', gap: 16 },
  rail: { alignItems: 'center' },
  line: {
    flex: 1,
    width: 3,
    marginVertical: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  itemText: { flex: 1, paddingTop: 5, gap: 2 },
  itemTitle: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  note: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: 16 },
  noteText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
});
