import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Screen from '@/components/ui/Screen';
import { getAssignment } from '@/features/assignment/assignmentStore';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { firstName } from '@/features/assignment/assign';
import CheckInCard from '@/features/home/components/CheckInCard';
import EmergencyContactCard from '@/features/home/components/EmergencyContactCard';
import HomeHeader from '@/features/home/components/HomeHeader';
import MoodCard from '@/features/home/components/MoodCard';
import SessionCard from '@/features/home/components/SessionCard';
import WeekTodos from '@/features/home/components/WeekTodos';
import { currentStudyWeek } from '@/features/home/currentWeek';
import { logMood, todaysMood } from '@/features/mood/moodStore';
import { getOnboardingData } from '@/features/onboarding/onboardingStore';
import { sessionContent } from '@/features/sessions/content';
import { useSessionProgress } from '@/features/sessions/progressStore';
import { modulesDone } from '@/features/sessions/sessionLogic';
import { SESSIONS } from '@/features/sessions/sessions';
import { haptics } from '@/lib/haptics';

const stagger = (index: number) => FadeInDown.delay(60 * index).duration(380);

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
  const sessionDone = Boolean(record?.completedAt);

  const todos = [
    { label: 'Log today’s mood', done: mood !== null },
    { label: `Complete Session ${session.id}`, done: sessionDone },
    { label: 'Do this week’s practice', done: false },
    {
      label: researcher ? `Check in with ${firstName(researcher.name)}` : 'Weekly check-in',
      done: false,
    },
  ];

  function handleLogMood(value: number) {
    setMood(logMood(value));
    haptics.success();
  }

  return (
    <Screen insideTabs>
      <View style={styles.body}>
        <Animated.View entering={stagger(0)}>
          <HomeHeader name={name} week={week} />
        </Animated.View>
        <EmergencyContactCard />
        <Animated.View entering={stagger(1)}>
          <SessionCard
            session={session}
            modulesDone={content ? modulesDone(content, record) : 0}
            modulesTotal={content?.modules.length ?? 0}
            minutes={content?.modules.reduce((sum, m) => sum + m.minutes, 0) ?? 0}
            completed={sessionDone}
          />
        </Animated.View>
        <Animated.View entering={stagger(2)}>
          <MoodCard today={mood} onLog={handleLogMood} />
        </Animated.View>
        <Animated.View entering={stagger(3)}>
          <CheckInCard researcher={researcher} />
        </Animated.View>
        <Animated.View entering={stagger(4)}>
          <WeekTodos todos={todos} />
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 16 },
});
