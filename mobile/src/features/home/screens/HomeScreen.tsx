import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { getAssignment } from '@/features/assignment/assignmentStore';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import CheckInCard from '@/features/home/components/CheckInCard';
import DailyMood from '@/features/home/components/DailyMood';
import EmergencyContactCard from '@/features/home/components/EmergencyContactCard';
import HomeHero from '@/features/home/components/HomeHero';
import WeekTiles from '@/features/home/components/WeekTiles';
import { currentStudyWeek } from '@/features/home/currentWeek';
import { JOURNAL_PROMPTS, promptIndexForDay } from '@/features/journal/journalPrompts';
import { logMood, todaysMood } from '@/features/mood/moodStore';
import { getOnboardingData } from '@/features/onboarding/onboardingStore';
import { sessionContent } from '@/features/sessions/content';
import { useSessionProgress } from '@/features/sessions/progressStore';
import { modulesDone } from '@/features/sessions/sessionLogic';
import { SESSIONS } from '@/features/sessions/sessions';
import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

const GUTTER = 24;
const stagger = (index: number) => FadeInDown.delay(70 * index).duration(380);

function readBasics() {
  const assignment = getAssignment();
  return {
    name: getOnboardingData().name,
    week: currentStudyWeek(),
    researcher: MOCK_RESEARCHERS.find((r) => r.id === assignment?.researcherId),
  };
}

export default function HomeScreen() {
  const [{ name, week, researcher }, setBasics] = useState(readBasics);
  // Re-read on focus so a name changed in Profile, or a new study week, shows straight away.
  useFocusEffect(useCallback(() => setBasics(readBasics()), []));
  const [mood, setMood] = useState(() => todaysMood());
  const progress = useSessionProgress();

  const session = SESSIONS[week - 1];
  const content = sessionContent(session.id);
  const record = progress[session.id];

  function handleLogMood(value: number) {
    setMood(logMood(value));
    haptics.success();
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Fills the overscroll above the hero so pulling down shows mint, not cream. */}
      <View style={styles.overscroll} />

      <Animated.View entering={FadeInDown.duration(380)}>
        <HomeHero name={name} week={week} />
      </Animated.View>

      <View style={styles.body}>
        <EmergencyContactCard />

        <Animated.View entering={stagger(1)}>
          <DailyMood today={mood} onLog={handleLogMood} />
        </Animated.View>

        <Animated.View entering={stagger(2)}>
          <WeekTiles
            sessionId={session.id}
            sessionTitle={session.title}
            minutes={content?.modules.reduce((sum, m) => sum + m.minutes, 0) ?? 0}
            partsDone={content ? modulesDone(content, record) : 0}
            partsTotal={content?.modules.length ?? 0}
            sessionDone={Boolean(record?.completedAt)}
            prompt={JOURNAL_PROMPTS[promptIndexForDay()]}
          />
        </Animated.View>

        <Animated.View entering={stagger(3)} style={styles.checkIn}>
          <Text style={styles.heading}>Your check-in</Text>
          <CheckInCard researcher={researcher} />
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  // Room for the floating chat button, so it never covers the last section.
  content: { paddingBottom: 110 },
  overscroll: {
    position: 'absolute',
    top: -1000,
    left: 0,
    right: 0,
    height: 1000,
    backgroundColor: '#CFEBDD',
  },
  body: { gap: 30, paddingHorizontal: GUTTER, paddingTop: 22 },
  checkIn: { gap: 14 },
  heading: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
});
