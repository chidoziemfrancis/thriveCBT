import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import {
  PHQ9_OPTIONS,
  PHQ9_QUESTIONS,
  SUICIDAL_IDEATION_INDEX,
  severityBand,
} from '@/features/assessment/phq9';
import { useResearcher } from '@/features/researcher/useResearcher';
import { colors, fonts, radius, type } from '@/theme';

const MAX_SCORE = PHQ9_QUESTIONS.length * 3;

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Every PHQ-9 answer a student gave, laid out like the paper form clinicians already know:
 * one question per line with the answer beside it.
 */
export default function Phq9AnswersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students } = useResearcher();
  const student = students.find((s) => s.id === id);

  if (!student) {
    return (
      <Screen>
        <BackButton />
        <Text style={[type.body, styles.missing]}>This student isn’t in your caseload.</Text>
      </Screen>
    );
  }

  const { answers, score, at } = student.phq9;

  return (
    <Screen>
      <BackButton />

      <View style={styles.header}>
        <Text style={type.title}>PHQ-9 answers</Text>
        <Text style={styles.meta}>
          {student.name} · {longDate(at)}
        </Text>
      </View>

      <View
        style={styles.summary}
        accessible
        accessibilityLabel={`Score ${score} of ${MAX_SCORE}, ${severityBand(score)}`}
      >
        <Text style={styles.score}>
          {score}
          <Text style={styles.scoreOf}> / {MAX_SCORE}</Text>
        </Text>
        <Text style={styles.band}>{severityBand(score)}</Text>
      </View>

      <Text style={styles.prompt}>
        Over the last 2 weeks, how often have you been bothered by any of the following problems?
      </Text>

      <View>
        {PHQ9_QUESTIONS.map((question, i) => {
          const answer = answers[i] ?? 0;
          const risk = i === SUICIDAL_IDEATION_INDEX && answer > 0;
          const label = PHQ9_OPTIONS.find((o) => o.value === answer)?.label ?? 'Not answered';
          return (
            <View
              key={question}
              style={[styles.item, i > 0 && styles.divider, risk && styles.itemRisk]}
              accessible
              accessibilityLabel={`Question ${i + 1}: ${question}. Answer: ${label}.`}
            >
              <View style={styles.itemHead}>
                <Text style={[styles.number, risk && { color: colors.danger }]}>{i + 1}</Text>
                <Text style={styles.question}>{question}</Text>
              </View>
              <View style={styles.answerRow}>
                <Text
                  style={[
                    styles.answer,
                    answer > 0 && styles.answerSome,
                    risk && styles.answerRisk,
                  ]}
                >
                  {label}
                </Text>
                <Text style={styles.points}>{answer}</Text>
              </View>
              {risk && (
                <Text style={styles.riskNote}>
                  Thoughts of self-harm. Follow up with {student.name.split(' ')[0]} today.
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: 24 },
  header: { gap: 4, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  summary: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginTop: 20 },
  score: { fontFamily: fonts.heavy, fontSize: 34, color: colors.ink },
  scoreOf: { fontFamily: fonts.medium, fontSize: 17, color: colors.inkFaint },
  band: { fontFamily: fonts.bold, fontSize: 16, color: colors.primary },
  prompt: {
    marginTop: 20,
    marginBottom: 6,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkMuted,
  },
  item: { gap: 8, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  // Question 9 is the one answer that changes what the researcher does today.
  itemRisk: {
    paddingHorizontal: 12,
    marginHorizontal: -12,
    borderRadius: radius.md,
    borderTopWidth: 0,
    backgroundColor: colors.dangerSoft,
  },
  itemHead: { flexDirection: 'row', gap: 10 },
  number: { width: 18, fontFamily: fonts.bold, fontSize: 14, color: colors.inkFaint },
  question: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: colors.ink },
  answerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 28 },
  answer: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.inkMuted,
  },
  answerSome: { color: colors.ink },
  answerRisk: { color: colors.danger },
  points: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkFaint },
  riskNote: { marginLeft: 28, fontFamily: fonts.bold, fontSize: 13, color: colors.danger },
});
