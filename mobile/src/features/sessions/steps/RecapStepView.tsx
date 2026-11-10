import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { CheckIcon, CloseIcon } from '@/components/icons';
import type { RecapStep, SessionStep, StepAnswer } from '@/features/sessions/content/types';
import { diaryAnswers } from '@/features/sessions/sessionLogic';
import { colors, fonts } from '@/theme';

import { stepText } from './stepText';

function ScaleBars({
  steps,
  answers,
}: {
  steps: SessionStep[];
  answers: Record<string, StepAnswer>;
}) {
  return (
    <View style={styles.list}>
      {steps.map((s, i) => {
        if (s.kind !== 'scale') return null;
        const value = typeof answers[s.id] === 'number' ? (answers[s.id] as number) : 0;
        return (
          <Animated.View
            key={s.id}
            entering={FadeInDown.delay(60 * i).duration(300)}
            style={styles.barRow}
            accessible
            accessibilityLabel={`${s.short ?? s.title}: ${value} of 5`}
          >
            <Text style={styles.barLabel}>{s.short ?? s.title}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(value / 5) * 100}%` }]} />
            </View>
            <Text style={styles.barValue}>{value}/5</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

function QuizScore({
  steps,
  answers,
}: {
  steps: SessionStep[];
  answers: Record<string, StepAnswer>;
}) {
  const questions = steps.filter((s) => s.kind === 'choice');
  const right = questions.filter((q) => q.kind === 'choice' && answers[q.id] === q.answer).length;
  return (
    <View style={styles.list}>
      <Animated.Text entering={ZoomIn.springify()} style={styles.score}>
        {right} of {questions.length}
      </Animated.Text>
      {questions.map((q, i) => {
        if (q.kind !== 'choice') return null;
        const ok = answers[q.id] === q.answer;
        return (
          <View key={q.id} style={[styles.qRow, i > 0 && styles.divider]}>
            <View style={[styles.mark, ok ? styles.markOk : styles.markNo]}>
              {ok ? (
                <CheckIcon size={11} color={colors.onPrimary} />
              ) : (
                <CloseIcon size={10} color={colors.danger} />
              )}
            </View>
            <Text style={styles.qText}>{q.question}</Text>
          </View>
        );
      })}
    </View>
  );
}

function DiaryTriangle({
  step,
  answers,
}: {
  step: RecapStep;
  answers: Record<string, StepAnswer>;
}) {
  const diary = diaryAnswers(step, answers);
  if (!diary) return null;
  const corners = [
    { label: 'Thought', text: diary.thought },
    { label: 'Feeling', text: diary.feeling },
    { label: 'Do', text: diary.action },
  ];
  return (
    <View style={styles.list}>
      <View style={styles.situation}>
        <Text style={styles.cornerLabel}>What happened</Text>
        <Text style={styles.cornerText}>{diary.situation}</Text>
      </View>
      {corners.map((c, i) => (
        <Animated.View
          key={c.label}
          entering={FadeInDown.delay(100 * i).duration(300)}
          style={styles.corner}
        >
          <Text style={styles.cornerLabel}>{c.label}</Text>
          <Text style={styles.cornerText}>{c.text || '—'}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

export default function RecapStepView({
  step,
  steps,
  answers,
}: {
  step: RecapStep;
  steps: SessionStep[];
  answers: Record<string, StepAnswer>;
}) {
  return (
    <View style={styles.wrap}>
      <View style={stepText.block}>
        <Text style={stepText.title}>{step.title}</Text>
        <Text style={stepText.body}>{step.body}</Text>
      </View>
      {step.of === 'scales' && <ScaleBars steps={steps} answers={answers} />}
      {step.of === 'quiz' && <QuizScore steps={steps} answers={answers} />}
      {step.of === 'diary' && <DiaryTriangle step={step} answers={answers} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 24, paddingTop: 12 },
  list: { gap: 14 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  barLabel: { width: 112, fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 5, backgroundColor: colors.primary },
  barValue: {
    width: 34,
    textAlign: 'right',
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.inkMuted,
  },
  score: { fontFamily: fonts.heavy, fontSize: 40, color: colors.primary },
  qRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  mark: {
    width: 22,
    height: 22,
    marginTop: 1,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markOk: { backgroundColor: colors.primary },
  markNo: { backgroundColor: colors.dangerSoft },
  situation: { gap: 4, padding: 14, borderRadius: 14, backgroundColor: colors.surfaceMuted },
  corner: {
    gap: 4,
    paddingVertical: 10,
    paddingLeft: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  cornerLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  cornerText: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink },
  qText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: colors.ink },
});
