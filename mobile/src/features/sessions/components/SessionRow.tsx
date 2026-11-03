import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon, ChevronRightIcon, LockIcon } from '@/components/icons';
import type { SessionStatus } from '@/features/sessions/sessionLogic';
import type { Session } from '@/features/sessions/sessions';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

const STATUS_LABEL: Record<SessionStatus, string> = {
  done: 'done',
  current: 'this week',
  available: 'open',
  locked: 'locked',
};

/** One session: its number, its title, and a single mark for where it stands. */
export default function SessionRow({
  session,
  status,
}: {
  session: Session;
  status: SessionStatus;
}) {
  const locked = status === 'locked';
  const current = status === 'current';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: locked }}
      accessibilityLabel={`Session ${session.id}, ${session.title}, ${STATUS_LABEL[status]}`}
      disabled={locked}
      onPress={() => {
        haptics.tick();
        router.push(`/session/${session.id}`);
      }}
      style={({ pressed }) => [styles.row, current && styles.current, pressed && { opacity: 0.6 }]}
    >
      <Text style={[styles.number, current && styles.currentText, locked && styles.faded]}>
        {String(session.id).padStart(2, '0')}
      </Text>
      <Text style={[styles.title, locked && styles.faded]} numberOfLines={2}>
        {session.title}
      </Text>
      {status === 'done' ? (
        <View style={styles.tick}>
          <CheckIcon size={12} color={colors.onPrimary} />
        </View>
      ) : locked ? (
        <LockIcon size={14} color={colors.inkFaint} />
      ) : (
        <ChevronRightIcon color={current ? colors.primary : colors.inkFaint} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginHorizontal: -14,
    borderRadius: radius.md,
  },
  current: { backgroundColor: colors.primarySoft },
  number: { width: 32, fontFamily: fonts.medium, fontSize: 17, color: colors.inkFaint },
  currentText: { color: colors.primary },
  title: { flex: 1, fontFamily: fonts.bold, fontSize: 16, lineHeight: 21, color: colors.ink },
  faded: { opacity: 0.4 },
  tick: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
