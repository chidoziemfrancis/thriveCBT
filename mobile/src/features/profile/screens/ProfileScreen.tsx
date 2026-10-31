import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Glyph } from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import { firstName } from '@/features/assignment/assign';
import { getAssignment } from '@/features/assignment/assignmentStore';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { signOut } from '@/features/auth/signOut';
import { getUserSession } from '@/features/auth/userSession';
import UserAvatar from '@/features/avatar/components/UserAvatar';
import { getConsent } from '@/features/consent/consentStore';
import { currentStudyWeek } from '@/features/home/currentWeek';
import { getOnboardingData } from '@/features/onboarding/onboardingStore';
import SettingsRow, { SettingsGroup } from '@/features/profile/components/SettingsRow';
import { useEmergencyContact } from '@/features/profile/emergencyContactStore';
import { SESSIONS } from '@/features/sessions/sessions';
import { setPreference, usePreferences } from '@/lib/preferences';
import { colors, fonts } from '@/theme';

function readProfile() {
  const assignment = getAssignment();
  return {
    name: getOnboardingData().name ?? '',
    email: getUserSession().email ?? '',
    week: currentStudyWeek(),
    researcher: MOCK_RESEARCHERS.find((r) => r.id === assignment?.researcherId),
    consent: getConsent(),
  };
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState(readProfile);
  useFocusEffect(useCallback(() => setProfile(readProfile()), []));
  const { contact } = useEmergencyContact();
  const preferences = usePreferences();

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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change your avatar"
          onPress={() => router.push('/profile/avatar')}
          style={({ pressed }) => pressed && { opacity: 0.8 }}
        >
          <UserAvatar size={AVATAR} />
          <View style={styles.editBadge}>
            <Glyph name="pencil" size={12} color={colors.onPrimary} />
          </View>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.name}>{profile.name || 'Your profile'}</Text>
          <Text style={styles.meta}>
            Week {profile.week} of {SESSIONS.length}
            {researcherName ? ` · with ${researcherName}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        <SettingsGroup>
          <SettingsRow kind="static" icon="mail" label="Email" value={profile.email || 'Not set'} />
          {/* The one call to action on the page, until a contact is added. */}
          {!contact && (
            <SettingsRow
              kind="highlight"
              icon="shield"
              label="Add an emergency contact"
              onPress={() => router.push('/profile/emergency-contact')}
            />
          )}
          <SettingsRow
            icon="pencil"
            label="Name"
            value={profile.name || undefined}
            action="Edit"
            onPress={() => router.push('/profile/name')}
          />
          <SettingsRow
            icon="lock"
            label="Change PIN"
            onPress={() => router.push('/profile/change-pin')}
          />
        </SettingsGroup>

        <SettingsGroup>
          {contact && (
            <SettingsRow
              icon="phone"
              label="Emergency contact"
              value={contact.name}
              onPress={() => router.push('/profile/emergency-contact')}
            />
          )}
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

        <SettingsGroup>
          <SettingsRow
            icon="bell"
            label="Notifications"
            onPress={() => router.push('/profile/notifications')}
          />
          <SettingsRow
            kind="toggle"
            icon="device"
            label="Vibration"
            on={preferences.vibration}
            onChange={(on) => setPreference('vibration', on)}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon="eye"
            label="What your researcher can see"
            onPress={() => router.push('/profile/privacy')}
          />
          <SettingsRow
            icon="checkCircle"
            label="Your consent"
            value={profile.consent ? shortDate(profile.consent.agreedAt) : undefined}
            onPress={() => router.push('/profile/consent')}
          />
          <SettingsRow
            icon="document"
            label="Terms of use"
            onPress={() => router.push({ pathname: '/profile/legal', params: { doc: 'terms' } })}
          />
          <SettingsRow
            icon="document"
            label="Privacy policy"
            onPress={() => router.push({ pathname: '/profile/legal', params: { doc: 'privacy' } })}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon="flag"
            label="Withdraw from the study"
            danger
            onPress={() => router.push('/profile/withdraw')}
          />
          <SettingsRow icon="logout" label="Log out" danger onPress={confirmLogOut} />
        </SettingsGroup>

        <Text style={styles.version}>ThriveCBT {Constants.expoConfig?.version ?? ''}</Text>
      </View>
    </Screen>
  );
}

const AVATAR = 56;

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16 },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.heavy, fontSize: 22, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkMuted },
  list: { marginTop: 18 },
  version: {
    marginTop: 24,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.inkFaint,
  },
});
