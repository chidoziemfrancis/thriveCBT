import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Glyph } from '@/components/icons/FeatureIcon';
import Screen from '@/components/ui/Screen';
import StudentAvatar from '@/features/researcher/components/StudentAvatar';
import { InboxFilter, inboxRows, inboxTime } from '@/features/researcher/messagesLogic';
import { useResearcherChat } from '@/features/researcher/researcherChatStore';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

/**
 * Every student chat, after WhatsApp's chat list and Airbnb's host inbox: unanswered risk
 * first, then flagged, unread and recent conversations.
 */
export default function MessagesScreen() {
  const { students, now } = useResearcher();
  const chat = useResearcherChat();
  const [filter, setFilter] = useState<InboxFilter>('all');

  const all = inboxRows(students, chat);
  const rows = inboxRows(students, chat, filter);
  const chips: { key: InboxFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: `Unread ${all.filter((r) => r.unread > 0).length}` },
    { key: 'followUp', label: `Follow-up ${all.filter((r) => r.followUp).length}` },
  ];

  return (
    <Screen insideTabs>
      <Text style={type.title}>Messages</Text>

      <View style={styles.chips} accessibilityRole="tablist">
        {chips.map((chip) => {
          const on = chip.key === filter;
          return (
            <Pressable
              key={chip.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => {
                haptics.tick();
                setFilter(chip.key);
              }}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{chip.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {rows.length === 0 ? (
        <Text style={styles.empty}>
          {filter === 'all' ? 'No conversations yet.' : 'Nothing here right now.'}
        </Text>
      ) : (
        <View style={styles.list}>
          {rows.map(({ student, last, unread, risk, followUp }, i) => {
            const mine = last?.from === 'researcher';
            return (
              <Pressable
                key={student.id}
                accessibilityRole="button"
                accessibilityLabel={`${student.name}${risk ? ', risk words' : ''}${followUp ? ', flagged for follow-up' : ''}${unread ? `, ${unread} unread` : ''}. ${last?.text ?? ''}`}
                onPress={() => {
                  haptics.tick();
                  router.push({ pathname: '/researcher/chat/[id]', params: { id: student.id } });
                }}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
              >
                <StudentAvatar id={student.id} name={student.name} size={48} />
                <View style={[styles.body, i > 0 && styles.divider]}>
                  <View style={styles.top}>
                    <Text style={styles.name} numberOfLines={1}>
                      {student.name}
                    </Text>
                    {followUp && <Glyph name="flag" size={14} color={colors.butterInk} />}
                    <Text style={[styles.time, unread > 0 && { color: colors.primary }]}>
                      {last ? inboxTime(last.sentAt, now) : ''}
                    </Text>
                  </View>
                  <View style={styles.bottom}>
                    {risk && <View style={styles.riskDot} />}
                    <Text
                      style={[
                        styles.preview,
                        unread > 0 && styles.previewUnread,
                        risk && { color: colors.danger },
                      ]}
                      numberOfLines={1}
                    >
                      {mine ? 'You: ' : ''}
                      {last?.text}
                    </Text>
                    {unread > 0 && (
                      <View style={[styles.badge, risk && { backgroundColor: colors.danger }]}>
                        <Text style={styles.badgeText}>{unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: 8, marginTop: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkMuted },
  chipTextOn: { color: colors.onPrimary },
  empty: { marginTop: 24, fontFamily: fonts.medium, fontSize: 15, color: colors.inkMuted },
  list: { marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  body: { flex: 1, gap: 4, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  top: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  time: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  riskDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  preview: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.inkMuted },
  previewUnread: { fontFamily: fonts.bold, color: colors.ink },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.onPrimary },
});
