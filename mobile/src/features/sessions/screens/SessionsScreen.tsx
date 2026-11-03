import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Screen from '@/components/ui/Screen';
import { currentStudyWeek } from '@/features/home/currentWeek';
import SessionRow from '@/features/sessions/components/SessionRow';
import { useSessionProgress } from '@/features/sessions/progressStore';
import { sessionStatus } from '@/features/sessions/sessionLogic';
import { SESSIONS } from '@/features/sessions/sessions';
import { colors, fonts, type } from '@/theme';

export default function SessionsScreen() {
  const progress = useSessionProgress();
  const [week, setWeek] = useState(() => currentStudyWeek());

  // A new session can unlock while the app stays open across a week boundary.
  useFocusEffect(useCallback(() => setWeek(currentStudyWeek()), []));

  const statuses = SESSIONS.map((s) => sessionStatus(s.id, week, progress[s.id]));
  const completed = statuses.filter((s) => s === 'done').length;

  return (
    <Screen insideTabs>
      <Text style={type.title}>Your sessions</Text>
      <Text style={styles.subtitle}>
        {completed} of {SESSIONS.length} done
      </Text>

      <View style={styles.list}>
        {SESSIONS.map((session, i) => (
          <Animated.View
            key={session.id}
            entering={FadeInDown.delay(40 * i).duration(300)}
            // No line touching the highlighted row, so its tint stands on its own.
            style={
              i > 0 && statuses[i] !== 'current' && statuses[i - 1] !== 'current' && styles.divider
            }
          >
            <SessionRow session={session} status={statuses[i]} />
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: 4, fontFamily: fonts.medium, fontSize: 15, color: colors.inkMuted },
  list: { marginTop: 20 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
});
