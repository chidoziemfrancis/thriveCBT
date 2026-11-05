import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import { MAX_CASELOAD } from '@/features/assignment/assign';
import ResearcherPhoto from '@/features/assignment/components/ResearcherPhoto';
import { signOut } from '@/features/auth/signOut';
import SettingsRow, { SettingsGroup } from '@/features/profile/components/SettingsRow';
import { hoursSummary } from '@/features/researcher/schedule';
import { setNotify, updateSettings } from '@/features/researcher/settingsStore';
import { useResearcher } from '@/features/researcher/useResearcher';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

const MIN_CAPACITY = 1;

export default function ResearcherSettingsScreen() {
  const { researcher, students, settings } = useResearcher();

  if (!researcher) {
    return (
      <Screen>
        <BackButton />
      </Screen>
    );
  }

  // Never below the students already assigned.
  const lowest = Math.max(MIN_CAPACITY, students.length);

  function changeCapacity(by: number) {
    const next = Math.min(MAX_CASELOAD, Math.max(lowest, researcher!.capacity + by));
    if (next === researcher!.capacity) return;
    haptics.tick();
    updateSettings({ capacity: next });
  }

  function confirmLogOut() {
    Alert.alert('Log out?', 'You’ll need your email and password to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.dismissAll();
          router.replace('/');
        },
      },
    ]);
  }

  return (
    <Screen>
      <BackButton />

      <View style={styles.header}>
        <View style={styles.photo}>
          <ResearcherPhoto researcher={researcher} initialsStyle={styles.photoInitials} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{researcher.name}</Text>
          <Text style={styles.title}>{researcher.title}</Text>
        </View>
      </View>

      <View style={styles.list}>
        <SettingsGroup first>
          <SettingsRow
            icon="pencil"
            label="Name"
            value={researcher.name}
            action="Edit"
            onPress={() => router.push('/researcher/edit-profile')}
          />
          <SettingsRow
            icon="document"
            label="Bio for students"
            detail={researcher.bio}
            action="Edit"
            onPress={() => router.push('/researcher/edit-profile')}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon="clock"
            label="Availability"
            value={hoursSummary(settings.hours)}
            onPress={() => router.push('/researcher/availability')}
          />
          <View style={styles.stepperRow}>
            <View style={styles.stepperText}>
              <Text style={styles.stepperLabel}>Caseload limit</Text>
              <Text style={styles.stepperDetail}>{students.length} students now</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Lower the limit"
              accessibilityState={{ disabled: researcher.capacity <= lowest }}
              disabled={researcher.capacity <= lowest}
              onPress={() => changeCapacity(-1)}
              style={[styles.step, researcher.capacity <= lowest && styles.stepOff]}
            >
              <Text style={styles.stepText}>−</Text>
            </Pressable>
            <Text style={styles.capacity} accessibilityLabel={`Limit ${researcher.capacity}`}>
              {researcher.capacity}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Raise the limit"
              accessibilityState={{ disabled: researcher.capacity >= MAX_CASELOAD }}
              disabled={researcher.capacity >= MAX_CASELOAD}
              onPress={() => changeCapacity(1)}
              style={[styles.step, researcher.capacity >= MAX_CASELOAD && styles.stepOff]}
            >
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
          <SettingsRow
            kind="toggle"
            icon="checkCircle"
            label="Accepting new students"
            detail={
              researcher.accepting
                ? 'New students can be matched with you'
                : 'You won’t be matched with new students'
            }
            on={researcher.accepting}
            onChange={(on) => updateSettings({ accepting: on })}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            kind="toggle"
            icon="chat"
            label="New messages"
            on={settings.notify.messages}
            onChange={(on) => setNotify('messages', on)}
          />
          <SettingsRow
            kind="static"
            icon="shield"
            label="Urgent alerts"
            value="Always on"
            detail="Safety alerts always reach you"
          />
          <SettingsRow
            kind="toggle"
            icon="video"
            label="Call reminders"
            on={settings.notify.calls}
            onChange={(on) => setNotify('calls', on)}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow icon="logout" label="Log out" danger onPress={confirmLogOut} />
        </SettingsGroup>
      </View>
    </Screen>
  );
}

const PHOTO = 56;

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16 },
  photo: {
    width: PHOTO,
    height: PHOTO,
    borderRadius: PHOTO / 2,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoInitials: { fontFamily: fonts.heavy, fontSize: 20, color: colors.lavenderInk },
  headerText: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.heavy, fontSize: 22, color: colors.ink },
  title: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  list: { marginTop: 18 },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingVertical: 10,
  },
  stepperText: { flex: 1, gap: 2, marginLeft: 37 },
  stepperLabel: { fontFamily: fonts.medium, fontSize: 16, color: colors.ink },
  stepperDetail: { fontFamily: fonts.regular, fontSize: 13, color: colors.inkMuted },
  step: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepOff: { opacity: 0.35 },
  stepText: { fontFamily: fonts.bold, fontSize: 18, color: colors.ink },
  capacity: {
    width: 32,
    textAlign: 'center',
    fontFamily: fonts.heavy,
    fontSize: 17,
    color: colors.ink,
  },
});
