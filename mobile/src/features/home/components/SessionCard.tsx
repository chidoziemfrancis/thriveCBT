import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import Emoji from '@/components/icons/Emoji';
import Button from '@/components/ui/Button';
import { MODULES_PER_SESSION, SESSIONS, Session } from '@/features/sessions/sessions';
import { colors, fonts, radius } from '@/theme';

export default function SessionCard({
  session,
  modulesDone,
}: {
  session: Session;
  modulesDone: number;
}) {
  const started = modulesDone > 0;
  const progress = modulesDone / MODULES_PER_SESSION;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.text}>
          <Text style={styles.eyebrow}>
            This week · Session {session.id} of {SESSIONS.length}
          </Text>
          <Text style={styles.title}>{session.title}</Text>
          <Text style={styles.focus}>{session.focus}</Text>
        </View>
        <Emoji name="books" size={52} />
      </View>

      <View
        style={styles.track}
        accessibilityLabel={`${modulesDone} of ${MODULES_PER_SESSION} parts done`}
      >
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.meta}>
        {modulesDone} of {MODULES_PER_SESSION} parts done · about 35–50 min
      </Text>

      <Button variant="secondary" onPress={() => router.push('/sessions')}>
        {started ? 'Continue session' : 'Start session'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, padding: 20, borderRadius: radius.lg, backgroundColor: colors.primary },
  top: { flexDirection: 'row', gap: 12 },
  text: { flex: 1, gap: 4 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  title: { fontFamily: fonts.heavy, fontSize: 22, lineHeight: 27, color: colors.onPrimary },
  focus: { fontFamily: fonts.medium, fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.onPrimary },
  meta: { fontFamily: fonts.medium, fontSize: 13, color: 'rgba(255,255,255,0.85)' },
});
