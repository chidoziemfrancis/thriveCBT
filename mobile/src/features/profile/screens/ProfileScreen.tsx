import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import { firstName, initials } from '@/features/assignment/assign';
import { getAssignment } from '@/features/assignment/assignmentStore';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { signOut } from '@/features/auth/signOut';
import { getUserSession } from '@/features/auth/userSession';
import { getCheckInHistory } from '@/features/checkin/checkinStore';
import { getConsent } from '@/features/consent/consentStore';
import { currentStudyWeek } from '@/features/home/currentWeek';
import { getMoodLog } from '@/features/mood/moodStore';
import { getOnboardingData } from '@/features/onboarding/onboardingStore';
import SettingsRow, { SettingsGroup } from '@/features/profile/components/SettingsRow';
import { useEmergencyContact } from '@/features/profile/emergencyContactStore';
import { useSessionProgress } from '@/features/sessions/progressStore';
import { SESSIONS } from '@/features/sessions/sessions';
import { setPreference, usePreferences } from '@/lib/preferences';
import { colors, fonts, radius, type } from '@/theme';

function readProfile() {
  const assignment = getAssignment();
  return {
    name: getOnboardingData().name ?? '',
    email: getUserSession().email ?? '',
    week: currentStudyWeek(),
    researcher: MOCK_RESEARCHERS.find((r) => r.id === assignment?.researcherId),
    moods: getMoodLog().length,
    checkIns: getCheckInHistory().length,
    consent: getConsent(),
  };
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState(readProfile);
  useFocusEffect(useCallback(() => setProfile(readProfile()), []));
  const progress = useSessionProgress();
  const { contact } = useEmergencyContact();
  const preferences = usePreferences();

  const sessionsDone = SESSIONS.filter((s) => progress[s.id]?.completedAt).length;
  const researcherName = profile.researcher ? firstName(profile.researcher.name) : null;

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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(profile.name) || '?'}</Text>
        </View>
        <Text style={type.title}>{profile.name || 'Your profile'}</Text>
        {profile.email !== '' && <Text style={type.caption}>{profile.email}</Text>}
        <Text style={styles.meta}>
          Week {profile.week} of {SESSIONS.length}
          {researcherName ? ` · with ${researcherName}` : ''}
        </Text>
      </View>

      <View style={styles.stats}>
        <Stat value={`${sessionsDone}/${SESSIONS.length}`} label="Sessions" />
        <View style={styles.divider} />
        <Stat value={profile.moods} label="Moods logged" />
        <View style={styles.divider} />
        <Stat value={profile.checkIns} label="Check-ins" />
      </View>

      <View style={styles.groups}>
        <SettingsGroup title="Account">
          <SettingsRow
            icon="pencil"
            label="Your name"
            detail={profile.name || 'Add your name'}
            onPress={() => router.push('/profile/name')}
          />
          <SettingsRow
            kind="static"
            icon="mail"
            label="Email"
            detail={profile.email || 'Not set'}
          />
          <SettingsRow
            icon="lock"
            label="Change PIN"
            onPress={() => router.push('/profile/change-pin')}
          />
        </SettingsGroup>

        <SettingsGroup title="Safety">
          <SettingsRow
            icon="phone"
            label="Emergency contact"
            detail={contact ? `${contact.name} · ${contact.relationship}` : 'Not added yet'}
            onPress={() => router.push('/profile/emergency-contact')}
          />
          <SettingsRow
            icon="shield"
            label="Help & crisis contacts"
            onPress={() => router.push('/support')}
          />
          {researcherName && (
            <SettingsRow
              icon="chat"
              label={`Message ${researcherName}`}
              onPress={() => router.push('/chat')}
            />
          )}
        </SettingsGroup>

        <SettingsGroup title="Preferences">
          <SettingsRow
            icon="bell"
            label="Notifications"
            detail="Reminders, messages and check-ins"
            onPress={() => router.push('/profile/notifications')}
          />
          <SettingsRow
            kind="toggle"
            icon="device"
            label="Vibration"
            detail="Little taps when you press and finish things"
            value={preferences.vibration}
            onChange={(value) => setPreference('vibration', value)}
          />
        </SettingsGroup>

        <SettingsGroup title="Your data & the study">
          <SettingsRow
            icon="eye"
            label="What your researcher can see"
            onPress={() => router.push('/profile/privacy')}
          />
          <SettingsRow
            icon="checkCircle"
            label="Your consent"
            detail={
              profile.consent
                ? `Agreed ${new Date(profile.consent.agreedAt).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}`
                : 'Not recorded'
            }
            onPress={() => router.push('/profile/consent')}
          />
          <SettingsRow
            label="Withdraw from the study"
            danger
            onPress={() => router.push('/profile/withdraw')}
          />
        </SettingsGroup>

        <SettingsGroup title="Legal">
          <SettingsRow
            label="Terms of use"
            onPress={() => router.push({ pathname: '/profile/legal', params: { doc: 'terms' } })}
          />
          <SettingsRow
            label="Privacy policy"
            onPress={() => router.push({ pathname: '/profile/legal', params: { doc: 'privacy' } })}
          />
        </SettingsGroup>

        <SettingsGroup title="Session">
          <SettingsRow label="Log out" danger onPress={confirmLogOut} />
        </SettingsGroup>

        <Text style={styles.version}>ThriveCBT {Constants.expoConfig?.version ?? ''}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 4, marginTop: 8 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 8,
    backgroundColor: colors.primaryEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.heavy, fontSize: 32, color: colors.onPrimary },
  meta: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary, marginTop: 4 },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: fonts.heavy, fontSize: 20, color: colors.ink },
  statLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted },
  divider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border },
  groups: { gap: 22, marginTop: 24 },
  version: {
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.inkFaint,
  },
});
