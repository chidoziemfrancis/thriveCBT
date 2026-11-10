import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import PercentSlider from '@/features/sessions/components/PercentSlider';
import SessionPhoto from '@/features/sessions/components/SessionPhoto';
import type { EmotionStep } from '@/features/sessions/content/types';
import { EMOTION_FAMILIES, readEmotion } from '@/features/sessions/emotions';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

const FACE = 72;
const START_STRENGTH = 50;

/** Family, then the exact word, then how strong: one small choice at a time. */
export default function EmotionStepView({
  step,
  answer,
  onAnswer,
}: {
  step: EmotionStep;
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  const { family, word, strength } = readEmotion(answer);
  const chosen = EMOTION_FAMILIES.find((f) => f.id === family);

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
      </View>

      <View style={styles.faces} accessibilityRole="radiogroup">
        {EMOTION_FAMILIES.map((f) => {
          const on = f.id === family;
          return (
            <Pressable
              key={f.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={f.label}
              onPress={() => {
                if (on) return;
                haptics.tick();
                onAnswer([f.id]);
              }}
              style={({ pressed }) => [
                styles.family,
                chosen && !on && styles.faded,
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <View style={[styles.face, { borderColor: on ? f.color : 'transparent' }]}>
                <SessionPhoto photo={f.face} style={styles.faceImage} />
              </View>
              <Text style={[styles.familyLabel, on && { color: colors.ink }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {chosen && (
        <Animated.View key={chosen.id} entering={FadeInDown.duration(280)} style={styles.section}>
          <Text style={styles.sectionTitle}>Which word fits best?</Text>
          <View style={styles.words}>
            {chosen.words.map((w) => {
              const on = w === word;
              return (
                <Pressable
                  key={w}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    haptics.tick();
                    onAnswer([chosen.id, w, String(strength ?? START_STRENGTH)]);
                  }}
                  style={[
                    styles.word,
                    on && { borderColor: chosen.color, backgroundColor: `${chosen.color}26` },
                  ]}
                >
                  <Text style={[styles.wordText, on && { fontFamily: fonts.bold }]}>{w}</Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      )}

      {chosen && word && strength !== undefined && (
        <Animated.View entering={FadeIn.duration(250)} style={styles.section}>
          <Text style={styles.sectionTitle}>How strong is it?</Text>
          <PercentSlider
            value={strength}
            color={chosen.color}
            label={`How strong ${word.toLowerCase()} feels`}
            onChange={(v) => onAnswer([chosen.id, word, String(v)])}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 22, paddingTop: 8 },
  faces: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  family: { width: '31%', alignItems: 'center', gap: 6 },
  faded: { opacity: 0.45 },
  face: {
    width: FACE + 8,
    height: FACE + 8,
    borderRadius: (FACE + 8) / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceImage: { width: FACE, height: FACE, borderRadius: FACE / 2 },
  familyLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkMuted },
  section: { gap: 12 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  words: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  word: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  wordText: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink },
});
