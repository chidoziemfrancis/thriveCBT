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
import InsightCard from '@/features/progress/components/InsightCard';
import JourneyCard from '@/features/progress/components/JourneyCard';
import MoodTrend from '@/features/progress/components/MoodTrend';
import Phq9Card from '@/features/progress/components/Phq9Card';
import StatsCard from '@/features/progress/components/StatsCard';
import ThisWeekCard from '@/features/progress/components/ThisWeekCard';
import WeekStrip from '@/features/progress/components/WeekStrip';
import {
  badges,
  currentWeek,
  dailyMoods,
  goodDayShare,
  longestStreak,
  moodInsight,
  moodStreak,
} from '@/features/progress/progressLogic';
import { useSessionProgress } from '@/features/sessions/progressStore';
import { SESSIONS } from '@/features/sessions/sessions';
import { colors, fonts, type } from '@/theme';

// Whether students see their own PHQ-9 trend is a study design decision, since seeing scores
// can change how people answer later. Hidden until the study team confirms.
const SHOW_PHQ9_TREND = false;

const MONTH_DAYS = 30;

function readActivity() {
  return {
    week: currentStudyWeek(),
    moods: getMoodLog(),
    checkIns: getCheckInHistory().length,
    journalEntries: getJournal().length,
    phq9: getPhq9Scores(),
  };
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

export default function ProgressScreen() {
  const [activity, setActivity] = useState(readActivity);
  const progress = useSessionProgress();

  // Moods, calls and journal entries are added on other screens, so refresh on every visit.
  useFocusEffect(useCallback(() => setActivity(readActivity()), []));

  const { moods } = activity;
  const streak = moodStreak(moods);
  const week = currentWeek(moods);
  const share = goodDayShare(week);
  const insight = moodInsight(moods);
  const daysLogged = dailyMoods(moods, MONTH_DAYS).filter((d) => d.mood !== null).length;
  const sessionsDone = SESSIONS.filter((s) => progress[s.id]?.completedAt).length;

  const earned = badges({
    sessionsDone,
    totalSessions: SESSIONS.length,
    moodsLogged: moods.length,
    bestStreak: longestStreak(moods),
    checkIns: activity.checkIns,
    journalEntries: activity.journalEntries,
  });

  const sections = [
    <WeekStrip key="strip" days={week} />,
    <StatsCard
      key="stats"
      stats={[
        { label: 'Days logged', value: `${daysLogged}/${MONTH_DAYS}` },
        { label: 'Streak', value: plural(streak, 'day') },
        { label: 'Check-in calls', value: String(activity.checkIns) },
        { label: 'Journal entries', value: String(activity.journalEntries) },
      ]}
    />,
    <ThisWeekCard key="week" {...share} />,
    <MoodTrend key="trend" entries={moods} />,
    ...(insight ? [<InsightCard key="insight" text={insight} />] : []),
    <JourneyCard key="journey" week={activity.week} progress={progress} />,
    ...(SHOW_PHQ9_TREND ? [<Phq9Card key="phq9" scores={activity.phq9} />] : []),
    <BadgeGrid key="badges" items={earned} />,
  ];

  return (
    <Screen insideTabs>
      <Text style={type.title}>Your progress</Text>
      <Text style={styles.headline}>
        {streak > 1 ? `You’re on a ${streak} day streak` : 'Small steps add up'}
      </Text>

      <View style={styles.sections}>
        {sections.map((section, i) => (
          <Animated.View key={section.key} entering={FadeInDown.delay(60 * i).duration(320)}>
            {section}
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: { fontFamily: fonts.bold, fontSize: 17, color: colors.primary, marginTop: 4 },
  sections: { gap: 14, marginTop: 20 },
});
