import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { firstName } from '@/features/assignment/assign';
import { getAssignment } from '@/features/assignment/assignmentStore';
import ResearcherPhoto from '@/features/assignment/components/ResearcherPhoto';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { getNextCheckIn } from '@/features/checkin/checkinStore';
import { currentStudyWeek } from '@/features/home/currentWeek';
import { getOnboardingData } from '@/features/onboarding/onboardingStore';
import SessionPhoto from '@/features/sessions/components/SessionPhoto';
import type { InfoStep } from '@/features/sessions/content/types';
import { SESSIONS } from '@/features/sessions/sessions';
import { colors, fonts } from '@/theme';

import StepArt from './StepArt';
import { stepText } from './stepText';

function readContext() {
  const researcher = MOCK_RESEARCHERS.find((r) => r.id === getAssignment()?.researcherId);
  const checkIn = researcher ? getNextCheckIn(researcher.id) : null;
  return {
    name: (getOnboardingData().name ?? '').split(' ')[0],
    researcher,
    checkInDay: checkIn
      ? new Date(checkIn.startsAt).toLocaleDateString(undefined, { weekday: 'long' })
      : null,
    week: currentStudyWeek(),
  };
}

function ResearcherNote({ context }: { context: ReturnType<typeof readContext> }) {
  const { researcher, checkInDay } = context;
  if (!researcher) return null;
  const name = firstName(researcher.name);
  return (
    <View style={styles.note}>
      <View style={styles.noteAvatar}>
        <ResearcherPhoto researcher={researcher} initialsStyle={styles.noteInitials} />
      </View>
      <Text style={styles.noteText}>
        {checkInDay
          ? `${name} will talk this through with you on ${checkInDay}.`
          : `${name} is here if you have questions about this.`}
      </Text>
    </View>
  );
}

function PathPreview({ week }: { week: number }) {
  return (
    <View style={styles.path} accessible accessibilityLabel={`Week ${week} of ${SESSIONS.length}`}>
      <View style={styles.pathLine} />
      {SESSIONS.map((s) => (
        <View
          key={s.id}
          style={[styles.pathDot, s.id < week && styles.pathDone, s.id === week && styles.pathNow]}
        />
      ))}
    </View>
  );
}

export default function InfoStepView({ step }: { step: InfoStep }) {
  const [context] = useState(readContext);
  const title = step.title.replace('{name}', context.name || 'there').replace(/, there$/, '');

  if (step.photo) {
    return (
      <View style={styles.photoLayout}>
        <SessionPhoto photo={step.photo} style={styles.photo} />
        <Animated.View entering={FadeInDown.delay(120).duration(360)} style={stepText.block}>
          <Text style={stepText.title}>{title}</Text>
          <Text style={stepText.body}>{step.body}</Text>
          {step.path && <PathPreview week={context.week} />}
          {step.researcherNote && <ResearcherNote context={context} />}
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={stepText.center}>
      {step.art && <StepArt icon={step.art} tone={step.tone} />}
      <Animated.View entering={FadeInDown.delay(120).duration(360)} style={stepText.block}>
        <Text style={[stepText.title, stepText.centered]}>{title}</Text>
        <Text style={[stepText.body, stepText.centered]}>{step.body}</Text>
        {step.bullets && (
          <View style={styles.bullets}>
            {step.bullets.map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <View style={styles.dot} />
                <Text style={stepText.body}>{bullet}</Text>
              </View>
            ))}
          </View>
        )}
        {step.path && <PathPreview week={context.week} />}
        {step.researcherNote && <ResearcherNote context={context} />}
      </Animated.View>
    </View>
  );
}

const DOT = 14;

const styles = StyleSheet.create({
  photoLayout: { gap: 22, paddingTop: 4 },
  photo: { height: 230 },
  bullets: { gap: 8, marginTop: 4, alignSelf: 'stretch' },
  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 9, backgroundColor: colors.primary },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  noteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lavender,
  },
  noteInitials: { fontFamily: fonts.heavy, fontSize: 14, color: colors.lavenderInk },
  noteText: { flex: 1, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.ink },
  path: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  pathLine: {
    position: 'absolute',
    left: DOT / 2,
    right: DOT / 2,
    height: 2,
    backgroundColor: colors.border,
  },
  pathDot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pathDone: { borderColor: colors.primary, backgroundColor: colors.primary },
  pathNow: {
    width: DOT + 6,
    height: DOT + 6,
    borderRadius: (DOT + 6) / 2,
    borderWidth: 5,
    borderColor: colors.primary,
  },
});
