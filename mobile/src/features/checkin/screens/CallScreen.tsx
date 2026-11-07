import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { LifebuoyIcon } from '@/components/icons';
import { initials } from '@/features/assignment/assign';
import { getAssignment } from '@/features/assignment/assignmentStore';
import ResearcherPhoto from '@/features/assignment/components/ResearcherPhoto';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import CallView from '@/features/checkin/components/CallView';
import { getOnboardingData } from '@/features/onboarding/onboardingStore';
import { colors, fonts, radius } from '@/theme';

export default function CallScreen() {
  const params = useLocalSearchParams<{ mic?: string; cam?: string }>();
  const [{ researcher, studentName }] = useState(() => ({
    researcher: MOCK_RESEARCHERS.find((r) => r.id === getAssignment()?.researcherId),
    studentName: getOnboardingData().name ?? '',
  }));

  return (
    <CallView
      name={researcher?.name ?? 'Your researcher'}
      photo={<ResearcherPhoto researcher={researcher} initialsStyle={styles.avatarText} />}
      status="Demo call · live video connects once calls go live"
      selfInitials={initials(studentName)}
      micStartsOn={params.mic !== '0'}
      camStartsOn={params.cam !== '0'}
      onEnd={(seconds) =>
        router.replace({ pathname: '/call/feedback', params: { seconds: String(seconds) } })
      }
      topRight={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Get help now"
          onPress={() => router.push('/support')}
          style={styles.help}
          hitSlop={8}
        >
          <LifebuoyIcon size={18} color={colors.onPrimary} />
          <Text style={styles.helpText}>Help</Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  avatarText: { fontFamily: fonts.heavy, fontSize: 44, color: colors.lavenderInk },
  help: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
  },
  helpText: { fontFamily: fonts.bold, fontSize: 14, color: colors.onPrimary },
});
