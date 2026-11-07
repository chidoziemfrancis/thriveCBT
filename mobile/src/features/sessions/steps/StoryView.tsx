import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import StoryArt from '@/features/sessions/art/StoryArt';
import type { VideoStep } from '@/features/sessions/content/types';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

type Slide = NonNullable<VideoStep['slides']>[number];

/** Illustrated slides the student taps through, like a story, until the real video exists. */
export default function StoryView({ title, slides }: { title: string; slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const last = index === slides.length - 1;

  function go(by: number) {
    const next = Math.min(slides.length - 1, Math.max(0, index + by));
    if (next !== index) {
      haptics.tick();
      setIndex(next);
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={stepText.title}>{title}</Text>

      <View style={styles.story}>
        <View style={styles.bars}>
          {slides.map((s, i) => (
            <View key={s.text} style={[styles.bar, i <= index && styles.barOn]} />
          ))}
        </View>

        <Animated.View key={index} entering={FadeIn.duration(300)} style={styles.slide}>
          <StoryArt scene={slide.scene} />
          <Text style={styles.text} accessibilityLiveRegion="polite">
            {slide.text}
          </Text>
        </Animated.View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous"
          onPress={() => go(-1)}
          style={[styles.half, styles.left]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={last ? 'Last slide' : 'Next'}
          onPress={() => go(1)}
          style={[styles.half, styles.right]}
        />
      </View>

      <Text style={styles.hint}>
        {last
          ? 'That’s the loop. Tap Continue below.'
          : `Tap to go on · ${index + 1} of ${slides.length}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18, paddingTop: 12 },
  story: {
    minHeight: 360,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },
  bars: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.8)' },
  barOn: { backgroundColor: colors.primary },
  slide: { flex: 1, justifyContent: 'center', gap: 16, paddingTop: 10 },
  text: {
    fontFamily: fonts.heavy,
    fontSize: 20,
    lineHeight: 27,
    color: colors.ink,
    textAlign: 'center',
  },
  half: { position: 'absolute', top: 0, bottom: 0, width: '50%' },
  left: { left: 0 },
  right: { right: 0 },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted, textAlign: 'center' },
});
