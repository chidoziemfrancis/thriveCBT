import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { Glyph } from '@/components/icons/FeatureIcon';
import type { FeatureIconName } from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { alertStatus, studentAlerts } from '@/features/researcher/alerts';
import { AlertEvent, addAlertEvent } from '@/features/researcher/alertStore';
import StudentAvatar from '@/features/researcher/components/StudentAvatar';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const EVENT_LABEL: Record<AlertEvent['type'], string> = {
  acknowledged: 'You’re on it',
  note: 'Note',
  contactViewed: 'Emergency contact opened',
  escalated: 'Escalated to the study lead',
  handled: 'Marked as handled',
};

function when(iso: string) {
  const date = new Date(iso);
  return `${date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}, ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
}

function Action({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: FeatureIconName;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.actionCircle, danger && { backgroundColor: colors.dangerSoft }]}>
        <Glyph name={icon} size={20} color={danger ? colors.danger : colors.primary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

/**
 * One safety alert, after incident apps like PagerDuty: what triggered it, ways to reach the
 * student, and a timeline of what's been done, ending in "handled" with a note.
 */
export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students, alertEvents, now } = useResearcher();
  const [note, setNote] = useState('');
  const [showContact, setShowContact] = useState(false);

  const alert = students.flatMap((s) => studentAlerts(s, now)).find((a) => a.id === id);
  if (!alert) {
    return (
      <Screen>
        <BackButton />
        <Text style={[type.body, styles.missing]}>This alert couldn’t be found.</Text>
      </Screen>
    );
  }

  const { student } = alert;
  const first = student.name.split(' ')[0];
  const events = alertEvents[alert.id] ?? [];
  const status = alertStatus(events);
  const handled = status === 'handled';
  const hasNote = events.some((e) => e.type === 'note' || e.type === 'handled');

  function log(type: AlertEvent['type'], text?: string) {
    addAlertEvent(alert!.id, type, text);
  }

  function addNote() {
    if (!note.trim()) return;
    log('note', note);
    setNote('');
    haptics.tick();
  }

  function markHandled() {
    // A handled alert always says what was done, so a typed note goes with it.
    log('handled', note || undefined);
    setNote('');
    haptics.success();
  }

  function openContact() {
    Alert.alert(
      'Emergency contact',
      `Only use this if you’re seriously worried about ${first}’s safety. Opening it is recorded.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Show contact',
          style: 'destructive',
          onPress: () => {
            log('contactViewed');
            setShowContact(true);
          },
        },
      ]
    );
  }

  function escalate() {
    Alert.alert('Escalate to the study lead?', 'They’ll be told about this alert and your notes.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Escalate', onPress: () => log('escalated') },
    ]);
  }

  return (
    <Screen
      footer={
        handled ? undefined : (
          <View style={styles.footer}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="What did you do? e.g. Called Tolu, safety plan agreed"
              placeholderTextColor={colors.inkFaint}
              multiline
              maxLength={500}
              style={styles.input}
              accessibilityLabel="Note"
            />
            <View style={styles.footerRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !note.trim() }}
                disabled={!note.trim()}
                onPress={addNote}
                style={[styles.secondary, !note.trim() && { opacity: 0.4 }]}
              >
                <Text style={styles.secondaryText}>Add note</Text>
              </Pressable>
              <View style={styles.flex}>
                {status === 'new' ? (
                  <Button onPress={() => log('acknowledged')}>I’m on it</Button>
                ) : (
                  <Button disabled={!hasNote && !note.trim()} onPress={markHandled}>
                    Mark as handled
                  </Button>
                )}
              </View>
            </View>
            {status !== 'new' && !hasNote && !note.trim() && (
              <Text style={styles.hint}>Add a note about what you did first.</Text>
            )}
          </View>
        )
      }
    >
      <BackButton />

      <View style={styles.head}>
        <View style={styles.metaRow}>
          <View style={[styles.badge, !alert.urgent && styles.badgeSoft]}>
            <Text style={[styles.badgeText, !alert.urgent && { color: colors.butterInk }]}>
              {alert.urgent ? 'Urgent' : 'Needs review'}
            </Text>
          </View>
          <Text style={styles.status}>
            {handled ? 'Handled' : status === 'acknowledged' ? 'You’re on it' : 'New'}
          </Text>
          <Text style={styles.at}>{when(alert.at)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({ pathname: '/researcher/student/[id]', params: { id: student.id } })
          }
          style={styles.who}
        >
          <StudentAvatar id={student.id} name={student.name} size={36} />
          <Text style={styles.whoName}>{student.name}</Text>
          <Text style={styles.whoWeek}>Week {student.week}</Text>
        </Pressable>
        <Text style={type.title}>{alert.title}</Text>
        {alert.quote && <Text style={styles.quote}>“{alert.quote}”</Text>}
        {alert.detail && (
          <Text style={[styles.detail, alert.urgent && { color: colors.danger }]}>
            {alert.detail}
          </Text>
        )}
        {alert.kind === 'question9' || alert.kind === 'severe' ? (
          <Pressable
            accessibilityRole="link"
            onPress={() =>
              router.push({ pathname: '/researcher/student/[id]/phq9', params: { id: student.id } })
            }
          >
            <Text style={styles.link}>See all PHQ-9 answers</Text>
          </Pressable>
        ) : alert.kind === 'riskWords' ? (
          <Pressable
            accessibilityRole="link"
            onPress={() =>
              router.push({ pathname: '/researcher/chat/[id]', params: { id: student.id } })
            }
          >
            <Text style={styles.link}>Open the conversation</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Action
          icon="chat"
          label="Message"
          onPress={() =>
            router.push({ pathname: '/researcher/chat/[id]', params: { id: student.id } })
          }
        />
        <Action
          icon="calendar"
          label="Book a call"
          onPress={() =>
            router.push({ pathname: '/researcher/schedule', params: { studentId: student.id } })
          }
        />
        {alert.urgent && student.emergencyContact && (
          <Action icon="phone" label="Emergency contact" onPress={openContact} danger />
        )}
      </View>

      {showContact && student.emergencyContact && (
        <View style={styles.contact}>
          <View style={styles.contactText}>
            <Text style={styles.contactName}>
              {student.emergencyContact.name} · {student.emergencyContact.relationship}
            </Text>
            <Text style={styles.contactPhone}>{student.emergencyContact.phone}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Call ${student.emergencyContact.name}`}
            onPress={() =>
              Linking.openURL(`tel:${student.emergencyContact!.phone.replace(/\s/g, '')}`)
            }
            style={styles.callButton}
          >
            <Text style={styles.callText}>Call</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.sectionTitle}>What’s happened</Text>
      <View style={styles.timeline}>
        {[{ type: 'raised' as const, at: alert.at }, ...events].map((event, i, all) => {
          const last = i === all.length - 1;
          const label = event.type === 'raised' ? 'Alert raised' : EVENT_LABEL[event.type];
          const text = 'text' in event ? event.text : undefined;
          return (
            <View key={`${event.type}-${event.at}-${i}`} style={styles.event}>
              <View style={styles.rail}>
                <View
                  style={[
                    styles.dot,
                    event.type === 'handled' && { backgroundColor: colors.primary },
                    event.type === 'raised' && alert.urgent && { backgroundColor: colors.danger },
                  ]}
                >
                  {event.type === 'handled' && <CheckIcon size={9} color={colors.onPrimary} />}
                </View>
                {!last && <View style={styles.line} />}
              </View>
              <View style={styles.eventText}>
                <Text style={styles.eventLabel}>{label}</Text>
                <Text style={styles.eventAt}>{when(event.at)}</Text>
                {text && <Text style={styles.eventNote}>{text}</Text>}
              </View>
            </View>
          );
        })}
      </View>

      {!handled && (
        <Pressable
          accessibilityRole="button"
          onPress={escalate}
          hitSlop={8}
          style={styles.escalate}
        >
          <Text style={styles.escalateText}>Escalate to the study lead</Text>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  missing: { marginTop: 24 },
  head: { gap: 10, marginTop: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSoft,
  },
  badgeSoft: { backgroundColor: colors.butter },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.danger,
  },
  status: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
  at: { marginLeft: 'auto', fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  who: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  whoName: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  whoWeek: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  quote: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.ink },
  detail: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  link: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 28, marginTop: 24 },
  action: { alignItems: 'center', gap: 6, maxWidth: 90 },
  actionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.ink, textAlign: 'center' },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  contactText: { flex: 1, gap: 2 },
  contactName: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  contactPhone: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink },
  callButton: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    justifyContent: 'center',
  },
  callText: { fontFamily: fonts.bold, fontSize: 14, color: colors.onPrimary },
  sectionTitle: {
    marginTop: 28,
    marginBottom: 8,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  timeline: {},
  event: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 16 },
  dot: {
    width: 14,
    height: 14,
    marginTop: 3,
    borderRadius: 7,
    backgroundColor: colors.inkFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { flex: 1, width: 2, marginVertical: 2, backgroundColor: colors.border },
  eventText: { flex: 1, gap: 2, paddingBottom: 16 },
  eventLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  eventAt: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint },
  eventNote: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  escalate: { alignSelf: 'center', marginTop: 8 },
  escalateText: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkMuted },
  footer: { gap: 10 },
  input: {
    minHeight: 48,
    maxHeight: 110,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  secondary: { paddingHorizontal: 6, paddingVertical: 12 },
  secondaryText: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
  hint: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkFaint, textAlign: 'center' },
});
