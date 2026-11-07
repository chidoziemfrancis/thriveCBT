import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Glyph, type FeatureIconName } from '@/components/icons/FeatureIcon';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { firstName } from '@/features/assignment/assign';
import { getAssignment } from '@/features/assignment/assignmentStore';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import { askForReminders, skipReminders } from '@/features/onboarding/reminders';
import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

export default function RemindersScreen() {
  const [asking, setAsking] = useState(false);
  const researcher = MOCK_RESEARCHERS.find((r) => r.id === getAssignment()?.researcherId);
  const name = researcher ? firstName(researcher.name) : 'your researcher';

  const reasons: { icon: FeatureIconName; text: string }[] = [
    { icon: 'video', text: `Your weekly check-in with ${name}` },
    { icon: 'book', text: 'A new session each week' },
    { icon: 'heart', text: 'A quick mood check, once a day' },
  ];

  async function turnOn() {
    setAsking(true);
    const granted = await askForReminders();
    if (granted) haptics.success();
    router.replace('/auth/create-pin');
  }

  function notNow() {
    skipReminders();
    router.replace('/auth/create-pin');
  }

  return (
    <Screen
      footer={
        <>
          <Button disabled={asking} onPress={turnOn}>
            Turn on reminders
          </Button>
          <Button variant="ghost" onPress={notNow}>
            Not now
          </Button>
        </>
      }
    >
      <View style={styles.body}>
        <View style={styles.bell}>
          <Glyph name="bell" size={30} color={colors.primary} />
        </View>
        <Text style={styles.title}>Stay on track, gently</Text>
        <Text style={styles.lead}>We’ll remind you about:</Text>

        <View style={styles.reasons}>
          {reasons.map(({ icon, text }) => (
            <View key={text} style={styles.reason}>
              <Glyph name={icon} size={20} color={colors.primary} />
              <Text style={styles.reasonText}>{text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.private}>
          Never anything private on your lock screen. You can change these any time in Profile.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: 10 },
  bell: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  title: { fontFamily: fonts.heavy, fontSize: 26, color: colors.ink },
  lead: { fontFamily: fonts.medium, fontSize: 15, color: colors.inkMuted },
  reasons: { marginTop: 8 },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reasonText: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  private: {
    marginTop: 12,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkFaint,
  },
});
