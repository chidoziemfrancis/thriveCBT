import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChevronRightIcon } from '@/components/icons';
import { Glyph } from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import { ChatRow, toChatRows } from '@/features/chat/chatLogic';
import ChatComposer from '@/features/chat/components/ChatComposer';
import MessageBubble from '@/features/chat/components/MessageBubble';
import MoodFace from '@/features/mood/components/MoodFace';
import { MOODS } from '@/features/mood/moods';
import { moodOnDay } from '@/features/mood/moodLog';
import StudentAvatar from '@/features/researcher/components/StudentAvatar';
import { QUICK_REPLIES, threadFor, unansweredRisk } from '@/features/researcher/messagesLogic';
import {
  markThreadRead,
  sendToStudent,
  toggleFollowUp,
  useResearcherChat,
} from '@/features/researcher/researcherChatStore';
import { needsYou } from '@/features/researcher/todayLogic';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

/**
 * A chat with one student, using the same bubbles as the student side. A context bar at the
 * top (like Airbnb's booking details in a host's chat) shows how the student is doing.
 */
export default function ResearcherChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students, now } = useResearcher();
  const chat = useResearcherChat();
  const [draft, setDraft] = useState('');
  const student = students.find((s) => s.id === id);

  // Opening the conversation counts as reading it, and so does leaving it.
  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      markThreadRead(id);
      return () => markThreadRead(id);
    }, [id])
  );

  const thread = useMemo(() => (student ? threadFor(student, chat) : []), [student, chat]);
  // Inverted so the newest message sits at the bottom and the list opens scrolled there.
  const rows = useMemo(() => toChatRows(thread, now).reverse(), [thread, now]);

  if (!student) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.bare}>
          <BackButton />
          <Text style={[type.body, styles.missing]}>This student isn’t in your caseload.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const first = student.name.split(' ')[0];
  const flagged = chat.followUp.includes(student.id);
  const today = moodOnDay(student.moods, now);
  const alert = needsYou([student], now)[0];
  const risk = unansweredRisk(thread);

  function send(text: string) {
    sendToStudent(student!.id, text);
    setDraft('');
    haptics.tap();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton />
        <StudentAvatar id={student.id} name={student.name} size={40} />
        <Text style={styles.name} numberOfLines={1}>
          {student.name}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={flagged ? 'Clear follow-up flag' : 'Flag for follow-up'}
          accessibilityState={{ selected: flagged }}
          onPress={() => {
            haptics.tick();
            toggleFollowUp(student.id);
          }}
          hitSlop={8}
          style={[styles.flag, flagged && styles.flagOn]}
        >
          <Glyph name="flag" size={18} color={flagged ? colors.butterInk : colors.inkFaint} />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Week ${student.week}. ${today ? `${MOODS[today.mood].label} today.` : 'No mood today.'}${alert ? ` ${alert.reason}.` : ''} Open profile`}
        onPress={() =>
          router.push({ pathname: '/researcher/student/[id]', params: { id: student.id } })
        }
        style={[styles.context, (risk || alert?.urgent) && styles.contextRisk]}
      >
        <Text style={styles.contextText}>Week {student.week}</Text>
        <Text style={styles.contextDot}>·</Text>
        {today ? (
          <>
            <MoodFace mood={today.mood} size={16} />
            <Text style={styles.contextText}>{MOODS[today.mood].label} today</Text>
          </>
        ) : (
          <Text style={styles.contextText}>No mood today</Text>
        )}
        {alert && (
          <>
            <Text style={styles.contextDot}>·</Text>
            <View style={[styles.alertDot, !alert.urgent && { backgroundColor: '#D9A21B' }]} />
            <Text
              style={[styles.contextText, alert.urgent && styles.contextUrgent]}
              numberOfLines={1}
            >
              {alert.urgent ? 'Question 9' : alert.reason}
            </Text>
          </>
        )}
        <View style={styles.flex} />
        <ChevronRightIcon size={14} color={colors.inkFaint} />
      </Pressable>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {thread.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No messages with {first} yet. Say hello.</Text>
          </View>
        ) : (
          <FlatList<ChatRow>
            inverted
            data={rows}
            keyExtractor={(row) => row.key}
            contentContainerStyle={styles.list}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) =>
              item.kind === 'day' ? (
                <Text style={styles.day}>{item.label}</Text>
              ) : (
                <MessageBubble
                  message={item.message}
                  lastInGroup={item.lastInGroup}
                  viewer="researcher"
                />
              )
            }
          />
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.quickScroll}
          contentContainerStyle={styles.quick}
        >
          {QUICK_REPLIES.map((reply) => (
            <Pressable
              key={reply}
              accessibilityRole="button"
              accessibilityHint="Puts this in the message box to edit or send"
              onPress={() => {
                haptics.tick();
                setDraft(reply);
              }}
              style={({ pressed }) => [styles.quickChip, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.quickText}>{reply}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <ChatComposer
          onSend={send}
          value={draft}
          onChangeText={setDraft}
          placeholder={`Message ${first}…`}
          showHelp={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  bare: { padding: 16 },
  missing: { marginTop: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  name: { flex: 1, fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  flag: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagOn: { backgroundColor: colors.butter },
  context: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surfaceMuted,
  },
  contextRisk: { backgroundColor: colors.dangerSoft },
  contextText: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
  contextUrgent: { color: colors.danger },
  contextDot: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkFaint },
  alertDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.danger },
  list: { paddingHorizontal: 16, paddingVertical: 12 },
  day: {
    alignSelf: 'center',
    marginVertical: 10,
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.inkFaint,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  quickScroll: { flexGrow: 0 },
  quick: { gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  quickText: { fontFamily: fonts.medium, fontSize: 13, color: colors.ink },
});
