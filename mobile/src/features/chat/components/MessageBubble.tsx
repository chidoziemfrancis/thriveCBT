import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { CheckIcon, DoubleCheckIcon } from '@/components/icons';
import type { Message } from '@/features/chat/chatLogic';
import { colors, fonts, radius } from '@/theme';

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function MessageBubble({
  message,
  lastInGroup,
}: {
  message: Message;
  lastInGroup: boolean;
}) {
  const mine = message.from === 'student';
  const read = message.status === 'read';

  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      style={[styles.row, mine ? styles.rowMine : styles.rowTheirs, lastInGroup && styles.gap]}
    >
      <View
        style={[
          styles.bubble,
          mine ? styles.mine : styles.theirs,
          lastInGroup && (mine ? styles.tailMine : styles.tailTheirs),
        ]}
      >
        <Text style={[styles.text, mine && { color: colors.onPrimary }]}>{message.text}</Text>
      </View>

      {lastInGroup && (
        <View
          style={[styles.meta, mine && styles.metaMine]}
          accessibilityLabel={`${timeOf(message.sentAt)}${mine ? (read ? ', read' : ', sent') : ''}`}
        >
          <Text style={styles.time}>{timeOf(message.sentAt)}</Text>
          {mine &&
            (read ? (
              <DoubleCheckIcon size={15} color={colors.primary} />
            ) : (
              <CheckIcon size={12} color={colors.inkFaint} />
            ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { maxWidth: '82%', marginTop: 4 },
  rowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  rowTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  gap: { marginBottom: 8 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.lg },
  mine: { backgroundColor: colors.primary },
  theirs: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border },
  tailMine: { borderBottomRightRadius: 6 },
  tailTheirs: { borderBottomLeftRadius: 6 },
  text: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, color: colors.ink },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, paddingHorizontal: 4 },
  metaMine: { justifyContent: 'flex-end' },
  time: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
});
