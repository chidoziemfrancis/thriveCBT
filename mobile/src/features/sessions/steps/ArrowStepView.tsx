import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { CloseIcon } from '@/components/icons';
import { CORE_BELIEFS, readArrow, writeArrow } from '@/features/beliefs/utils/beliefs';
import type { ArrowStep } from '@/features/sessions/content/types';
import { useThoughtLog } from '@/features/thoughts/store/thoughtLogStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

import { stepText } from './stepText';

function Down() {
  return (
    <Svg width={18} height={22} viewBox="0 0 18 22" accessibilityElementsHidden>
      <Path
        d="M9 2v17M4 14l5 5 5-5"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function Chips({ items, onPick }: { items: string[]; onPick: (item: string) => void }) {
  return (
    <View style={styles.chips}>
      {items.map((item) => (
        <Pressable
          key={item}
          accessibilityRole="button"
          onPress={() => {
            haptics.tick();
            onPick(item);
          }}
          style={styles.chip}
        >
          <Text style={styles.chipText}>{item}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** A thought, followed down level by level until the core belief underneath is named. */
export default function ArrowStepView({
  step,
  answer,
  onAnswer,
}: {
  step: ArrowStep;
  answer: string[];
  onAnswer: (value: string[]) => void;
}) {
  const recent = useThoughtLog()
    .map((r) => r.thought)
    .filter(Boolean)
    .slice(0, 3);
  const { thought, levels, belief } = readArrow(answer);
  const [draft, setDraft] = useState('');
  const [naming, setNaming] = useState(false);
  const canGoDeeper = levels.length < step.maxDepth;

  function submit() {
    const text = draft.trim();
    if (!text) return;
    haptics.tap();
    setDraft('');
    if (!thought) return onAnswer(writeArrow(text, []));
    if (naming) return onAnswer(writeArrow(thought, levels, text));
    onAnswer(writeArrow(thought, [...levels, text]));
    if (levels.length + 1 >= step.maxDepth) setNaming(true);
  }

  const prompt = !thought
    ? 'Start with a thought that upset you'
    : naming || !canGoDeeper
      ? 'So which core belief is at the root?'
      : step.question;

  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        {step.body && <Text style={stepText.body}>{step.body}</Text>}
      </View>

      {thought ? (
        <View style={styles.chain}>
          <View style={[styles.card, styles.thought]}>
            <Text style={styles.cardLabel}>Thought</Text>
            <Text style={styles.cardText}>“{thought}”</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start again"
              hitSlop={10}
              onPress={() => {
                haptics.tick();
                setNaming(false);
                onAnswer([]);
              }}
              style={styles.reset}
            >
              <CloseIcon size={14} color={colors.inkFaint} />
            </Pressable>
          </View>
          {levels.map((level, i) => (
            <Animated.View
              key={`${i}-${level}`}
              entering={FadeInUp.duration(300)}
              style={styles.level}
            >
              <Down />
              <View style={[styles.card, { width: `${94 - i * 6}%` }]}>
                <Text style={styles.cardText}>{level}</Text>
              </View>
            </Animated.View>
          ))}
          {belief ? (
            <Animated.View entering={FadeInUp.duration(300)} style={styles.level}>
              <Down />
              <View style={[styles.card, styles.root]}>
                <Text style={[styles.cardLabel, styles.rootLabel]}>Core belief</Text>
                <Text style={[styles.cardText, styles.rootText]}>{belief}</Text>
              </View>
            </Animated.View>
          ) : null}
        </View>
      ) : null}

      {belief ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.reply}>
          <Text style={stepText.feedback}>
            That belief was learned, so it can be updated. You don’t have to believe it to look at
            it.
          </Text>
        </Animated.View>
      ) : (
        <View style={styles.ask}>
          <Text style={styles.question}>{prompt}</Text>
          {!thought && recent.length > 0 && (
            <Chips items={recent} onPick={(t) => onAnswer(writeArrow(t, []))} />
          )}
          {thought && (naming || !canGoDeeper) && (
            <Chips items={CORE_BELIEFS} onPick={(b) => onAnswer(writeArrow(thought, levels, b))} />
          )}
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submit}
            returnKeyType="done"
            placeholder={
              !thought ? 'e.g. I failed the test' : naming ? 'Or write it' : 'It would mean…'
            }
            placeholderTextColor={colors.inkFaint}
            accessibilityLabel={prompt}
            style={styles.input}
          />
          <View style={styles.buttons}>
            <Pressable
              accessibilityRole="button"
              disabled={!draft.trim()}
              onPress={submit}
              style={[styles.button, styles.primary, !draft.trim() && { opacity: 0.4 }]}
            >
              <Text style={styles.primaryText}>
                {!thought ? 'Start' : naming || !canGoDeeper ? 'That’s it' : 'Go deeper'}
              </Text>
            </Pressable>
            {thought && levels.length > 0 && !naming && canGoDeeper && (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  haptics.tick();
                  setNaming(true);
                }}
                style={[styles.button, styles.secondary]}
              >
                <Text style={styles.secondaryText}>I’ve reached the root</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 20, paddingTop: 8 },
  chain: { alignItems: 'center', gap: 4 },
  level: { alignItems: 'center', gap: 4, alignSelf: 'stretch' },
  card: {
    alignSelf: 'center',
    width: '100%',
    gap: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  thought: { backgroundColor: colors.lavender, borderColor: colors.lavender, paddingRight: 36 },
  reset: { position: 'absolute', right: 12, top: 12 },
  cardLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.lavenderInk,
  },
  cardText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 21, color: colors.ink },
  root: { width: '76%', backgroundColor: colors.butter, borderColor: colors.butterInk },
  rootLabel: { color: colors.butterInk },
  rootText: { fontFamily: fonts.heavy, fontSize: 17 },
  ask: { gap: 10 },
  question: { fontFamily: fonts.heavy, fontSize: 17, lineHeight: 23, color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
  },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: {
    paddingHorizontal: 18,
    height: 42,
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  primaryText: { fontFamily: fonts.bold, fontSize: 14, color: colors.onPrimary },
  secondary: { borderWidth: 1.5, borderColor: colors.primary },
  secondaryText: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  reply: { padding: 16, borderRadius: radius.md, backgroundColor: colors.primarySoft },
});
