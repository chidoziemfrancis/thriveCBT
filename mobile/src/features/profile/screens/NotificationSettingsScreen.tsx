import { Pressable, StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import SettingsRow, { SettingsGroup } from '@/features/profile/components/SettingsRow';
import { MoodReminderTime, setPreference, usePreferences } from '@/lib/preferences';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius, type } from '@/theme';

const TIMES: { value: MoodReminderTime; label: string }[] = [
  { value: '08:00', label: 'Morning' },
  { value: '12:00', label: 'Midday' },
  { value: '18:00', label: 'Evening' },
  { value: '21:00', label: 'Night' },
];

export default function NotificationSettingsScreen() {
  const preferences = usePreferences();

  return (
    <Screen>
      <BackButton />
      <Text style={[type.title, styles.title]}>Notifications</Text>
      <Text style={type.body}>Choose what we remind you about. You can change this any time.</Text>

      <View style={styles.groups}>
        <SettingsGroup title="Reminders">
          <SettingsRow
            kind="toggle"
            image="notebook"
            label="New sessions"
            detail="When this week’s session opens"
            value={preferences.notifySessions}
            onChange={(value) => setPreference('notifySessions', value)}
          />
          <SettingsRow
            kind="toggle"
            image="heart"
            label="Daily mood check"
            detail="A gentle nudge to log how you feel"
            value={preferences.notifyMood}
            onChange={(value) => setPreference('notifyMood', value)}
          />
          {preferences.notifyMood && (
            <View
              style={styles.times}
              accessibilityRole="radiogroup"
              accessibilityLabel="Reminder time"
            >
              {TIMES.map(({ value, label }) => {
                const selected = preferences.moodReminderTime === value;
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="radio"
                    accessibilityLabel={`${label}, ${value}`}
                    accessibilityState={{ selected }}
                    onPress={() => {
                      haptics.tick();
                      setPreference('moodReminderTime', value);
                    }}
                    style={[styles.time, selected && styles.timeSelected]}
                  >
                    <Text style={[styles.timeLabel, selected && { color: colors.onPrimary }]}>
                      {label}
                    </Text>
                    <Text style={[styles.timeValue, selected && { color: colors.onPrimary }]}>
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </SettingsGroup>

        <SettingsGroup title="Your researcher">
          <SettingsRow
            kind="toggle"
            image="chatBubble"
            label="Messages"
            detail="When your researcher replies"
            value={preferences.notifyMessages}
            onChange={(value) => setPreference('notifyMessages', value)}
          />
          <SettingsRow
            kind="toggle"
            image="videoCamera"
            label="Check-in reminders"
            detail="The day before and 10 minutes before"
            value={preferences.notifyCheckIns}
            onChange={(value) => setPreference('notifyCheckIns', value)}
          />
        </SettingsGroup>

        <Text style={type.caption}>
          Notifications never show what you wrote or how you feel, just a short reminder.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 18, marginBottom: 6 },
  groups: { gap: 22, marginTop: 20 },
  times: { flexDirection: 'row', gap: 8, padding: 12 },
  time: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  timeSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  timeLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
  timeValue: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted },
});
