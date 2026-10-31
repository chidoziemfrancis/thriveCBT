import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChatIcon } from '@/components/icons';
import Emoji from '@/components/icons/Emoji';
import { Researcher, firstName, initials } from '@/features/assignment/assign';
import { useChat } from '@/features/chat/chatStore';
import { colors, fonts, radius } from '@/theme';

export default function CheckInCard({ researcher }: { researcher: Researcher | undefined }) {
  const { unread } = useChat();

  if (!researcher) {
    return (
      <View style={styles.card}>
        <Emoji name="videoCamera" size={40} />
        <View style={styles.text}>
          <Text style={styles.title}>Weekly check-in</Text>
          <Text style={styles.meta}>
            We’re matching you with a researcher. Your check-ins will appear here.
          </Text>
        </View>
      </View>
    );
  }

  const name = firstName(researcher.name);
  return (
    <View style={[styles.card, styles.column]}>
      <View style={styles.top}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(researcher.name)}</Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Weekly check-in with {name}</Text>
          <Text style={styles.meta}>
            {name} will message you to book a time for your video call.
          </Text>
        </View>
        <Emoji name="videoCamera" size={34} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={unread ? `Message ${name}, ${unread} unread` : `Message ${name}`}
        onPress={() => router.push('/chat')}
        style={({ pressed }) => [styles.message, pressed && { opacity: 0.7 }]}
      >
        <ChatIcon size={18} color={colors.primary} />
        <Text style={styles.messageText}>Message {name}</Text>
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  column: { flexDirection: 'column', alignItems: 'stretch' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  messageText: { fontFamily: fonts.bold, fontSize: 15, color: colors.mintInk },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.heavy, fontSize: 12, color: colors.onPrimary },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.heavy, fontSize: 17, color: colors.lavenderInk },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.heavy, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.inkMuted },
});
