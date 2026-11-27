import { StyleSheet, Text, View } from 'react-native';

import FeatureIcon from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import HomeworkCard from '@/features/homework/components/HomeworkCard';
import { practiceDays } from '@/features/homework/homework';
import { usePracticeData } from '@/features/homework/usePracticeData';
import { currentStudyWeek } from '@/features/home/currentWeek';
import { sessionContent } from '@/features/sessions/content';
import { SESSIONS } from '@/features/sessions/constants/sessions';
import { colors, fonts, type } from '@/theme';

/** Each week's practice so far, with how many days it was done. */
export default function HomeworkScreen() {
  const data = usePracticeData();
  const week = currentStudyWeek();
  const weeks = SESSIONS.filter((s) => s.id <= week && sessionContent(s.id)).reverse();

  return (
    <Screen>
      <BackButton />
      <View style={styles.header}>
        <Text style={type.title}>Practice</Text>
        <Text style={styles.meta}>
          A little practice between sessions is what makes the skills stick.
        </Text>
      </View>

      <View style={styles.current}>
        <HomeworkCard sessionId={Math.min(week, SESSIONS.length)} />
      </View>

      <Text style={styles.section}>Every week</Text>
      {weeks.map((s, i) => {
        const days = practiceDays(s.id, data).size;
        return (
          <View key={s.id} style={[styles.row, i > 0 && styles.divider]}>
            <FeatureIcon
              name={days > 0 ? 'checkCircle' : 'clock'}
              size={40}
              tone={days > 0 ? 'mint' : 'neutral'}
            />
            <View style={styles.text}>
              <Text style={styles.title}>
                Week {s.id} · {s.title}
              </Text>
              <Text style={styles.practice}>{sessionContent(s.id)?.practice}</Text>
            </View>
            <Text style={[styles.days, days > 0 && styles.daysOn]}>
              {days} {days === 1 ? 'day' : 'days'}
            </Text>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  current: { marginTop: 24 },
  section: {
    marginTop: 32,
    marginBottom: 4,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  text: { flex: 1, gap: 3 },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  practice: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.inkMuted },
  days: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkFaint },
  daysOn: { color: colors.primary },
});
