import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Screen from '@/components/ui/Screen';
import { getPhq9Scores } from '@/features/assessment/scoreHistory';
import { getCheckInHistory } from '@/features/checkin/checkinStore';
import { currentStudyWeek } from '@/features/home/currentWeek';
import { getJournal } from '@/features/journal/journalStore';
import { getMoodLog } from '@/features/mood/moodStore';
import BadgeGrid from '@/features/progress/components/BadgeGrid';
import Highlights from '@/features/progress/components/Highlights';
import JourneyCard from '@/features/progress/components/JourneyCard';
import MoodChart from '@/features/progress/components/MoodChart';
import Phq9Card from '@/features/progress/components/Phq9Card';
import { badges, longestStreak } from '@/features/progress/progressLogic';
import { useSessionProgress } from '@/features/sessions/progressStore';
import { SESSIONS } from '@/features/sessions/sessions';
import { type } from '@/theme';

// Whether students see their own PHQ-9 trend is a study design decision, since seeing scores
// can change how people answer later. Hidden until the study team confirms.
const SHOW_PHQ9_TREND = false;

function readActivity() {
  return {
    week: currentStudyWeek(),
    moods: getMoodLog(),
    checkIns: getCheckInHistory().length,
    journalEntries: getJournal().length,
    phq9: getPhq9Scores(),
  };
}

export default function ProgressScreen() {
  const [activity, setActivity] = useState(readActivity);
  const progress = useSessionProgress();

  // Moods, calls and journal entries are added on other screens, so refresh on every visit.
  useFocusEffect(useCallback(() => setActivity(readActivity()), []));

  const sessionsDone = SESSIONS.filter((s) => progress[s.id]?.completedAt).length;
  const earned = badges({
    sessionsDone,
    totalSessions: SESSIONS.length,
    moodsLogged: activity.moods.length,
    bestStreak: longestStreak(activity.moods),
    checkIns: activity.checkIns,
    journalEntries: activity.journalEntries,
  });

  const sections = [
    <JourneyCard key="journey" week={activity.week} progress={progress} />,
    <MoodChart key="mood" entries={activity.moods} />,
    <Highlights
      key="highlights"
      items={[
        { label: 'Sessions done', value: `${sessionsDone}/${SESSIONS.length}`, image: 'play' },
        { label: 'Check-in calls', value: activity.checkIns, image: 'videoCamera' },
        { label: 'Moods logged', value: activity.moods.length, image: 'heart' },
        { label: 'Journal entries', value: activity.journalEntries, image: 'notebook' },
      ]}
    />,
    ...(SHOW_PHQ9_TREND ? [<Phq9Card key="phq9" scores={activity.phq9} />] : []),
    <BadgeGrid key="badges" items={earned} />,
  ];

  return (
    <Screen insideTabs>
      <Text style={type.title}>Your progress</Text>
      <Text style={[type.body, styles.subtitle]}>
        Small steps add up. Here’s everything you’ve put in so far.
      </Text>

      <View style={styles.sections}>
        {sections.map((section, i) => (
          <Animated.View key={section.key} entering={FadeInDown.delay(70 * i).duration(340)}>
            {section}
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: 6 },
  sections: { gap: 16, marginTop: 22 },
});
