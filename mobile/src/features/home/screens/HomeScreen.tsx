import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Screen from '@/components/ui/Screen';
import { getAssignment } from '@/features/assignment/assignmentStore';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { firstName } from '@/features/assignment/assign';
import { getConsent } from '@/features/consent/consentStore';
import CheckInCard from '@/features/home/components/CheckInCard';
import HomeHeader from '@/features/home/components/HomeHeader';
import MoodCard from '@/features/home/components/MoodCard';
import SessionCard from '@/features/home/components/SessionCard';
import SessionPath from '@/features/home/components/SessionPath';
import WeekTodos from '@/features/home/components/WeekTodos';
import { weekOfStudy } from '@/features/home/studyWeek';
import { logMood, todaysMood } from '@/features/mood/moodStore';
import { getOnboardingData } from '@/features/onboarding/onboardingStore';
import { SESSIONS } from '@/features/sessions/sessions';
import { haptics } from '@/lib/haptics';

const stagger = (index: number) => FadeInDown.delay(60 * index).duration(380);

export default function HomeScreen() {
  const [{ name, week, researcher }] = useState(() => {
    const assignment = getAssignment();
    return {
      name: getOnboardingData().name,
      week: weekOfStudy(getConsent()?.agreedAt ?? assignment?.assignedAt),
      researcher: MOCK_RESEARCHERS.find((r) => r.id === assignment?.researcherId),
    };
  });
  const [mood, setMood] = useState(() => todaysMood());

  const session = SESSIONS[week - 1];
  // Session modules aren't built yet, so nothing can be marked done there.
  const modulesDone = 0;

  const todos = [
    { label: 'Log today’s mood', done: mood !== null },
    { label: `Complete Session ${session.id}`, done: false },
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
        <Animated.View entering={stagger(1)}>
          <SessionCard session={session} modulesDone={modulesDone} />
        </Animated.View>
        <Animated.View entering={stagger(2)}>
          <MoodCard today={mood} onLog={handleLogMood} />
        </Animated.View>
        <Animated.View entering={stagger(3)}>
          <SessionPath current={session.id} />
        </Animated.View>
        <Animated.View entering={stagger(4)}>
          <CheckInCard researcher={researcher} />
        </Animated.View>
        <Animated.View entering={stagger(5)}>
          <WeekTodos todos={todos} />
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 16 },
});
