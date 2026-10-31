import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/icons';
import { SESSIONS, Session } from '@/features/sessions/sessions';
import { colors, fonts, radius } from '@/theme';

export default function SessionCard({
  session,
  modulesDone,
  modulesTotal,
  minutes,
  completed,
}: {
  session: Session;
  modulesDone: number;
  modulesTotal: number;
  minutes: number;
  completed: boolean;
}) {
  const started = modulesDone > 0;
  const progress = modulesTotal ? modulesDone / modulesTotal : 0;

  const action = completed ? 'Review session' : started ? 'Continue session' : 'Start session';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`This week, session ${session.id}: ${session.title}. ${action}.`}
      onPress={() => router.push(`/session/${session.id}`)}
      style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}
    >
      {/* Soft shapes give the card depth without adding anything to read. */}
      <View style={[styles.blob, styles.blobLarge]} />
      <View style={[styles.blob, styles.blobSmall]} />

      <View style={styles.pill}>
        <Text style={styles.pillText}>
          This week · Session {session.id} of {SESSIONS.length}
        </Text>
      </View>

      <Text style={styles.title}>{session.title}</Text>

      {started && !completed ? (
        <View style={styles.progress}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.meta}>
            {modulesDone} of {modulesTotal} parts done
          </Text>
        </View>
      ) : (
        <Text style={styles.meta}>
          {completed ? 'Done for this week. Nice work.' : `About ${minutes} min`}
        </Text>
      )}

      <View style={styles.button}>
        <Text style={styles.buttonText}>{action}</Text>
        <ChevronRightIcon size={16} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 220,
    justifyContent: 'flex-end',
    gap: 10,
    padding: 24,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  blobLarge: { width: 220, height: 220, top: -90, right: -70 },
  blobSmall: { width: 110, height: 110, top: 50, right: 40 },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 'auto',
  },
  pillText: { fontFamily: fonts.bold, fontSize: 12, color: colors.onPrimary },
  title: { fontFamily: fonts.heavy, fontSize: 26, lineHeight: 31, color: colors.onPrimary },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  progress: { gap: 8 },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.onPrimary },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    height: 44,
    paddingHorizontal: 20,
    marginTop: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  buttonText: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
});
