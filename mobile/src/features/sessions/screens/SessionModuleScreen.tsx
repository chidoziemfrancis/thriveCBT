import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInLeft,
  FadeInRight,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChevronLeftIcon } from '@/components/icons';
import { addJournalEntry } from '@/features/journal/journalStore';
import { sessionContent } from '@/features/sessions/content';
import type { SessionStep, StepAnswer } from '@/features/sessions/content/types';
import { completeModule, saveAnswer, useSessionProgress } from '@/features/sessions/progressStore';
import { isStepReady, nextModuleId, stepPosition } from '@/features/sessions/sessionLogic';
import BreatheStepView from '@/features/sessions/steps/BreatheStepView';
import ChecklistStepView from '@/features/sessions/steps/ChecklistStepView';
import ChoiceStepView from '@/features/sessions/steps/ChoiceStepView';
import InfoStepView from '@/features/sessions/steps/InfoStepView';
import JournalStepView from '@/features/sessions/steps/JournalStepView';
import MythFactStepView from '@/features/sessions/steps/MythFactStepView';
import RevealStepView from '@/features/sessions/steps/RevealStepView';
import ScaleStepView from '@/features/sessions/steps/ScaleStepView';
import VideoStepView from '@/features/sessions/steps/VideoStepView';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

// Long enough to see the chosen number light up before the next question slides in.
const SCALE_ADVANCE_MS = 350;

function ProgressBar({ done, total }: { done: number; total: number }) {
  const fill = useAnimatedStyle(() => ({
    width: withTiming(`${(total ? done / total : 0) * 100}%`, { duration: 300 }),
  }));
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: done }}
    >
      <Animated.View style={[styles.fill, fill]} />
    </View>
  );
}

export default function SessionModuleScreen() {
  const { id, module: moduleId } = useLocalSearchParams<{ id: string; module: string }>();
  const sessionId = Number(id);
  const content = sessionContent(sessionId);
  const progress = useSessionProgress();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  // Earlier answers come back when a part is reopened, so nothing has to be redone.
  const [answers, setAnswers] = useState<Record<string, StepAnswer>>(
    () => progress[sessionId]?.answers ?? {}
  );
  const advancing = useRef(false);

  const moduleIndex = content?.modules.findIndex((m) => m.id === moduleId) ?? -1;
  if (!content || moduleIndex < 0) return <Redirect href={`/session/${id}`} />;
  const module = content.modules[moduleIndex];
  const step = module.steps[stepIndex];
  const answer = answers[step.id];
  const position = stepPosition(content, module.id, stepIndex);
  const isLastStep = stepIndex === module.steps.length - 1;

  function setAnswer(value: StepAnswer) {
    setAnswers((current) => ({ ...current, [step.id]: value }));
  }

  function finishModule() {
    if (!content) return;
    completeModule(sessionId, module.id);
    haptics.success();
    // This render's progress predates completeModule, so count this module as done here.
    const next = nextModuleId(content, {
      ...progress[sessionId],
      done: [...(progress[sessionId]?.done ?? []), module.id],
    });
    router.replace(next ? `/session/${sessionId}/${next}` : `/session/${sessionId}/complete`);
  }

  function next(current: SessionStep = step, value: StepAnswer | undefined = answer) {
    if (advancing.current) return;
    if (value !== undefined) {
      saveAnswer(sessionId, current.id, value);
      if (current.kind === 'journal' && typeof value === 'string') {
        addJournalEntry({ prompt: current.prompt, text: value.trim(), sessionId });
      }
    }
    if (isLastStep) return finishModule();
    haptics.tick();
    setDirection(1);
    setStepIndex((i) => i + 1);
  }

  function back() {
    if (stepIndex === 0) return router.back();
    haptics.tick();
    setDirection(-1);
    setStepIndex((i) => i - 1);
  }

  const ready = isStepReady(step, answer);
  const label =
    step.kind === 'breathe' && answer !== true
      ? 'Skip for now'
      : step.kind === 'journal'
        ? 'Save and continue'
        : isLastStep && moduleIndex === content.modules.length - 1
          ? 'Finish session'
          : 'Continue';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <View style={styles.bar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={stepIndex === 0 ? 'Back to session' : 'Previous step'}
            onPress={back}
            hitSlop={10}
            style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}
          >
            <ChevronLeftIcon size={20} color={colors.ink} />
          </Pressable>
          <ProgressBar done={position.done + (ready ? 1 : 0)} total={position.total} />
        </View>
        <Text style={styles.part}>
          Part {moduleIndex + 1} of {content.modules.length} · {module.title}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            key={`${module.id}-${step.id}`}
            entering={(direction === 1 ? FadeInRight : FadeInLeft).duration(280)}
          >
            {step.kind === 'info' && <InfoStepView step={step} />}
            {step.kind === 'video' && <VideoStepView step={step} />}
            {step.kind === 'reveal' && (
              <RevealStepView
                step={step}
                revealed={Array.isArray(answer) ? (answer as string[]) : []}
                onReveal={setAnswer}
              />
            )}
            {step.kind === 'checklist' && (
              <ChecklistStepView
                step={step}
                picked={Array.isArray(answer) ? (answer as number[]) : []}
                onPick={setAnswer}
              />
            )}
            {step.kind === 'mythFact' && (
              <MythFactStepView
                step={step}
                answer={typeof answer === 'boolean' ? answer : undefined}
                onAnswer={setAnswer}
              />
            )}
            {step.kind === 'choice' && (
              <ChoiceStepView
                step={step}
                answer={typeof answer === 'number' ? answer : undefined}
                onAnswer={setAnswer}
              />
            )}
            {step.kind === 'scale' && (
              <ScaleStepView
                step={step}
                answer={typeof answer === 'number' ? answer : undefined}
                onAnswer={(value) => {
                  setAnswer(value);
                  // A rating moves on by itself, like the PHQ-9, so the check-in stays quick.
                  advancing.current = true;
                  setTimeout(() => {
                    advancing.current = false;
                    next(step, value);
                  }, SCALE_ADVANCE_MS);
                }}
              />
            )}
            {step.kind === 'breathe' && (
              <BreatheStepView step={step} done={answer === true} onDone={() => setAnswer(true)} />
            )}
            {step.kind === 'journal' && (
              <JournalStepView
                step={step}
                text={typeof answer === 'string' ? answer : ''}
                onChange={setAnswer}
              />
            )}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !ready }}
            disabled={!ready}
            onPress={() => next()}
            style={({ pressed }) => [
              styles.continue,
              !ready && styles.continueLocked,
              step.kind === 'breathe' && answer !== true && styles.continueQuiet,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text
              style={[
                styles.continueText,
                !ready && { color: colors.inkFaint },
                step.kind === 'breathe' && answer !== true && { color: colors.primary },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  top: { paddingHorizontal: 20, paddingTop: 8, gap: 8 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  track: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  part: { marginLeft: 44, fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  footer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 },
  continue: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueLocked: { backgroundColor: colors.surfaceMuted },
  continueQuiet: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
  continueText: { fontFamily: fonts.bold, fontSize: 17, color: colors.onPrimary },
});
