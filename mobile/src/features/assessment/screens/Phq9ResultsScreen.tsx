import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import Mascot from '@/components/mascot/Mascot';
import Button from '@/components/ui/Button';
import PageLoader from '@/components/ui/PageLoader';
import Screen from '@/components/ui/Screen';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

import SupportCard from '../components/SupportCard';
import { useSubmitPhq9 } from '../hooks/useAssessments';
import { clearAnswers, getAnswers, getPhq9Mode } from '../store/assessmentStore';
import { PHQ9_QUESTIONS, SUICIDAL_IDEATION_INDEX, phq9Score, severityBand } from '../utils/phq9';

const BANDS = ['Minimal', 'Mild', 'Moderate', 'Moderately severe', 'Severe'];

export default function Phq9ResultsScreen() {
  const [{ answers, score, needsSupport, final }] = useState(() => {
    const answers = getAnswers();
    return {
      answers: PHQ9_QUESTIONS.map((_, i) => answers[i] ?? 0),
      score: phq9Score(answers),
      needsSupport: (answers[SUICIDAL_IDEATION_INDEX] ?? 0) > 0,
      final: getPhq9Mode() === 'final',
    };
  });
  const submit = useSubmitPhq9();
  const { mutate } = submit;

  // Saved as soon as the screen opens, so the researcher is alerted even if the student closes
  // the app on the support screen. Sending again is safe: the server keeps the first result.
  const save = useCallback(
    () => mutate({ kind: final ? 'final' : 'baseline', answers }),
    [mutate, final, answers]
  );
  useEffect(save, [save]);

  // The crisis screen stays still on purpose: a celebratory buzz there would feel wrong.
  useEffect(() => {
    if (needsSupport || final) return;
    const timer = setTimeout(haptics.heartbeat, 300);
    return () => clearTimeout(timer);
  }, [needsSupport, final]);

  const saved = submit.isSuccess;

  // The week-8 check-in has its own results, so this screen only shows when support is needed.
  useEffect(() => {
    if (!final || needsSupport || !saved) return;
    clearAnswers();
    router.replace('/end-of-study/weeks');
  }, [final, needsSupport, saved]);

  function handleContinue() {
    if (!saved) return save();
    clearAnswers();
    router.replace(final ? '/end-of-study/weeks' : '/assessment/epqr');
  }

  const footer = (
    <>
      {submit.isError && <Text style={styles.error}>{submit.error.message}</Text>}
      <Button loading={submit.isPending} onPress={handleContinue}>
        {submit.isError ? 'Try again' : 'Continue'}
      </Button>
    </>
  );

  if (final && !needsSupport) {
    return submit.isError ? (
      <Screen footer={footer}>
        <View style={styles.body}>
          <Text style={[type.title, styles.centerText]}>Your check-in isn’t saved yet</Text>
        </View>
      </Screen>
    ) : (
      <PageLoader message="Saving your check-in" />
    );
  }

  if (needsSupport) {
    return (
      <Screen footer={footer}>
        <View style={styles.body}>
          <Animated.View entering={FadeInUp.duration(500)} style={styles.center}>
            <Mascot size={112} mood="calm" />
          </Animated.View>

          <View style={styles.copy}>
            <Text style={[type.title, styles.centerText]}>You’re not alone</Text>
            <Text style={[type.body, styles.centerText]}>
              You shared that you’ve had thoughts of hurting yourself or being better off dead.
              Thank you for being honest. This matters, and support is available right now.
            </Text>
          </View>

          <SupportCard />
        </View>
      </Screen>
    );
  }

  const band = severityBand(score);
  const bandIndex = BANDS.indexOf(band);

  return (
    <Screen footer={footer}>
      <View style={styles.body}>
        <Animated.View entering={FadeInUp.duration(500)} style={styles.center}>
          <Mascot size={112} mood="cheer" />
        </Animated.View>

        <View style={styles.copy}>
          <Text style={[type.title, styles.centerText]}>Check-in complete</Text>
          <Text style={[type.body, styles.centerText]}>
            Thanks for answering honestly. This is your starting point, and we’ll check in again at
            the end.
          </Text>
        </View>

        <Animated.View entering={FadeInDown.delay(200).duration(450)} style={styles.card}>
          <Text style={type.eyebrow}>Where you’re starting</Text>
          <Text style={styles.band}>{band}</Text>

          <View style={styles.meter} accessibilityElementsHidden>
            {BANDS.map((name, i) => (
              <View
                key={name}
                style={[styles.segment, i <= bandIndex && { backgroundColor: colors.primary }]}
              />
            ))}
          </View>

          <Text style={type.caption}>
            Score {score} of {PHQ9_QUESTIONS.length * 3}
          </Text>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: 24, paddingTop: 24 },
  center: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
  copy: { gap: 8 },
  card: {
    gap: 12,
    padding: 20,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  error: { fontFamily: fonts.medium, fontSize: 14, color: colors.danger, textAlign: 'center' },
  band: { fontFamily: fonts.heavy, fontSize: 30, color: colors.ink },
  meter: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
});
