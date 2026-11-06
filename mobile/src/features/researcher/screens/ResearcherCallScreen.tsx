import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import { initials } from '@/features/assignment/assign';
import CallView, { CALL_AVATAR } from '@/features/checkin/components/CallView';
import StudentAvatar from '@/features/researcher/components/StudentAvatar';
import { useResearcher } from '@/features/researcher/useResearcher';
import { colors, fonts, radius, type } from '@/theme';

// Demo only: the student "joins" a moment after the researcher, as they would from the lobby.
const DEMO_JOIN_MS = 4000;

export default function ResearcherCallScreen() {
  const { callId } = useLocalSearchParams<{ callId: string }>();
  const { researcher, students, calls } = useResearcher();
  const [call] = useState(() => calls.find((c) => c.id === callId));
  const student = call && students.find((s) => s.id === call.studentId);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setJoined(true), DEMO_JOIN_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!call || !student) {
    return (
      <Screen>
        <BackButton />
        <Text style={[type.body, styles.missing]}>This call couldn’t be found.</Text>
      </Screen>
    );
  }

  const first = student.name.split(' ')[0];

  return (
    <CallView
      name={student.name}
      photo={<StudentAvatar id={student.id} name={student.name} size={CALL_AVATAR} />}
      status={
        joined
          ? 'Demo call · live video connects once calls go live'
          : `Waiting for ${first} to join…`
      }
      connected={joined}
      selfInitials={initials(researcher?.name ?? '')}
      onEnd={(seconds) =>
        router.replace({
          pathname: '/researcher/call/[callId]/note',
          params: { callId: call.id, seconds: String(seconds), joined: joined ? '1' : '0' },
        })
      }
      topRight={
        <View style={styles.week}>
          <Text style={styles.weekText}>Week {student.week}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: 24 },
  week: {
    justifyContent: 'center',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  weekText: { fontFamily: fonts.bold, fontSize: 14, color: colors.onPrimary },
});
