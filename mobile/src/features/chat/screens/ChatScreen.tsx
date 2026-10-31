import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import Mascot from '@/components/mascot/Mascot';
import BackButton from '@/components/ui/BackButton';
import { Researcher, firstName, initials } from '@/features/assignment/assign';
import { getAssignment } from '@/features/assignment/assignmentStore';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { ChatRow, toChatRows } from '@/features/chat/chatLogic';
import { sendMessage, setChatOpen, useChat } from '@/features/chat/chatStore';
import ChatComposer from '@/features/chat/components/ChatComposer';
import MessageBubble from '@/features/chat/components/MessageBubble';
import TypingBubble from '@/features/chat/components/TypingBubble';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const REPLY_HOURS = 'Usually replies within a day';

// Shown after a flagged message is visibly sent, so the student sees it went through first.
const SUPPORT_DELAY_MS = 600;

function openers(name: string) {
  return [
    `Hi ${name}, nice to meet you!`,
    'I have a question about this week’s session',
    'Can we move our check-in?',
  ];
}

function Header({ researcher, typing }: { researcher: Researcher; typing: boolean }) {
  return (
    <View style={styles.header}>
      <BackButton />
      <View style={styles.headerAvatar}>
        <Text style={styles.headerAvatarText}>{initials(researcher.name)}</Text>
      </View>
      <View style={styles.headerText}>
        <Text style={styles.headerName} numberOfLines={1}>
          {researcher.name}
        </Text>
        <Text style={[styles.headerSub, typing && { color: colors.primary }]}>
          {typing ? 'typing…' : REPLY_HOURS}
        </Text>
      </View>
    </View>
  );
}

function EmptyChat({
  researcher,
  onPick,
}: {
  researcher: Researcher;
  onPick: (text: string) => void;
}) {
  const name = firstName(researcher.name);
  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.empty}>
      <View style={styles.emptyAvatar}>
        <Text style={styles.emptyAvatarText}>{initials(researcher.name)}</Text>
      </View>
      <Text style={[type.title, styles.center]}>Say hi to {name}</Text>
      <Text style={[type.body, styles.center]}>
        This is your private chat with {name}. Ask anything about the study, your sessions, or how
        your week is going.
      </Text>
      <View style={styles.openers}>
        {openers(name).map((text) => (
          <Pressable
            key={text}
            accessibilityRole="button"
            accessibilityHint="Sends this message"
            onPress={() => onPick(text)}
            style={({ pressed }) => [styles.opener, pressed && { transform: [{ scale: 0.97 }] }]}
          >
            <Text style={styles.openerText}>{text}</Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const { messages, typing } = useChat();
  const researcher = useMemo(
    () => MOCK_RESEARCHERS.find((r) => r.id === getAssignment()?.researcherId),
    []
  );

  useFocusEffect(
    useCallback(() => {
      setChatOpen(true);
      return () => setChatOpen(false);
    }, [])
  );

  // Inverted so the newest message sits at the bottom and the list opens scrolled there.
  const rows = useMemo(() => toChatRows(messages).reverse(), [messages]);

  function handleSend(text: string) {
    const sent = sendMessage(text);
    haptics.tap();
    if (sent.flagged) setTimeout(() => router.push('/support'), SUPPORT_DELAY_MS);
  }

  if (!researcher) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.headerBare}>
          <BackButton />
        </View>
        <View style={styles.empty}>
          <Mascot size={110} mood="calm" />
          <Text style={[type.title, styles.center]}>Chat opens once you’re matched</Text>
          <Text style={[type.body, styles.center]}>
            As soon as you have a researcher, you’ll be able to message them here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Header researcher={researcher} typing={typing} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {messages.length === 0 ? (
          <View style={styles.flex}>
            <EmptyChat researcher={researcher} onPick={handleSend} />
          </View>
        ) : (
          <FlatList<ChatRow>
            inverted
            data={rows}
            keyExtractor={(row) => row.key}
            contentContainerStyle={styles.list}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              typing ? <TypingBubble name={firstName(researcher.name)} /> : undefined
            }
            renderItem={({ item }) =>
              item.kind === 'day' ? (
                <Text style={styles.day}>{item.label}</Text>
              ) : (
                <MessageBubble message={item.message} lastInGroup={item.lastInGroup} />
              )
            }
          />
        )}
        <ChatComposer onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerBare: { paddingHorizontal: 16, paddingVertical: 10 },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: { fontFamily: fonts.heavy, fontSize: 15, color: colors.lavenderInk },
  headerText: { flex: 1 },
  headerName: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  headerSub: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  list: { paddingHorizontal: 16, paddingVertical: 12 },
  day: {
    alignSelf: 'center',
    marginVertical: 10,
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.inkMuted,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  emptyAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyAvatarText: { fontFamily: fonts.heavy, fontSize: 30, color: colors.lavenderInk },
  openers: { alignSelf: 'stretch', gap: 8, marginTop: 8 },
  opener: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  openerText: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
});
