import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Screen from '@/components/ui/Screen';
import { getPhq9Scores } from '@/features/assessment/scoreHistory';
import { getMoodLog } from '@/features/mood/moodStore';
import InsightCard from '@/features/progress/components/InsightCard';
import MoodTrend from '@/features/progress/components/MoodTrend';
import Phq9Card from '@/features/progress/components/Phq9Card';
import ThisWeekCard from '@/features/progress/components/ThisWeekCard';
import WeekStrip from '@/features/progress/components/WeekStrip';
import {
  currentWeek,
  goodDayShare,
  moodInsight,
  moodStreak,
} from '@/features/progress/progressLogic';
import { colors, fonts, type } from '@/theme';

// Whether students see their own PHQ-9 trend is a study design decision, since seeing scores
// can change how people answer later. Hidden until the study team confirms.
const SHOW_PHQ9_TREND = false;

function readActivity() {
  return {
    moods: getMoodLog(),
    phq9: getPhq9Scores(),
  };
}

export default function ProgressScreen() {
  const [activity, setActivity] = useState(readActivity);

  // Moods are logged on Home, so refresh on every visit.
  useFocusEffect(useCallback(() => setActivity(readActivity()), []));

  const { moods } = activity;
  const streak = moodStreak(moods);
  const week = currentWeek(moods);
  const share = goodDayShare(week);
  const insight = moodInsight(moods);

  const sections = [
    <WeekStrip key="strip" days={week} />,
    <ThisWeekCard key="week" {...share} />,
    <MoodTrend key="trend" entries={moods} />,
    ...(insight ? [<InsightCard key="insight" text={insight} />] : []),
    ...(SHOW_PHQ9_TREND ? [<Phq9Card key="phq9" scores={activity.phq9} />] : []),
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
            {/* Open sections split by hairlines instead of each sitting in its own card. */}
            {i > 0 && <View style={styles.divider} />}
            {section}
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: { fontFamily: fonts.bold, fontSize: 17, color: colors.primary, marginTop: 4 },
  sections: { marginTop: 20 },
  divider: { height: 1, marginVertical: 24, backgroundColor: colors.border },
});
