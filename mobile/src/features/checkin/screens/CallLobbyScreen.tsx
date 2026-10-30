import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { CameraIcon, CameraOffIcon, MicIcon, MicOffIcon } from '@/components/icons';
import Icon3D from '@/components/icons/Icon3D';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { firstName, initials } from '@/features/assignment/assign';
import { getAssignment } from '@/features/assignment/assignmentStore';
import { MOCK_RESEARCHERS } from '@/features/assignment/mockResearchers';
import CallControl from '@/features/checkin/components/CallControl';
import { getOnboardingData } from '@/features/onboarding/onboardingStore';
import { colors, fonts, radius, type } from '@/theme';

function PermissionAsk({ canAskAgain, onAllow }: { canAskAgain: boolean; onAllow: () => void }) {
  return (
    <Screen
      footer={
        canAskAgain ? (
          <Button onPress={onAllow}>Allow camera and microphone</Button>
        ) : (
          <Button onPress={() => Linking.openSettings()}>Open Settings</Button>
        )
      }
    >
      <BackButton />
      <View style={styles.permission}>
        <Icon3D name="videoCamera" size={96} />
        <Text style={[type.title, styles.center]}>Camera and microphone</Text>
        <Text style={[type.body, styles.center]}>
          Your researcher needs to see and hear you during check-ins. Calls are live only and are
          never recorded.
        </Text>
        {!canAskAgain && (
          <Text style={[type.caption, styles.center]}>
            Access was turned off. Switch on Camera and Microphone for ThriveCBT in Settings.
          </Text>
        )}
      </View>
    </Screen>
  );
}

export default function CallLobbyScreen() {
  const [camera, requestCamera] = useCameraPermissions();
  const [microphone, requestMicrophone] = useMicrophonePermissions();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [{ researcher, studentName }] = useState(() => ({
    researcher: MOCK_RESEARCHERS.find((r) => r.id === getAssignment()?.researcherId),
    studentName: getOnboardingData().name ?? '',
  }));

  if (!camera || !microphone) return null;

  if (!camera.granted || !microphone.granted) {
    return (
      <PermissionAsk
        canAskAgain={camera.canAskAgain && microphone.canAskAgain}
        onAllow={async () => {
          if (!camera.granted) await requestCamera();
          if (!microphone.granted) await requestMicrophone();
        }}
      />
    );
  }

  const name = researcher ? firstName(researcher.name) : 'Your researcher';

  return (
    <Screen
      footer={
        <Button
          onPress={() =>
            router.replace({
              pathname: '/call/live',
              params: { mic: micOn ? '1' : '0', cam: camOn ? '1' : '0' },
            })
          }
        >
          Join call
        </Button>
      }
    >
      <BackButton />

      <View style={styles.body}>
        <View style={styles.copy}>
          <Text style={type.title}>Ready to join?</Text>
          <View style={styles.status}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>{name} is ready for you</Text>
          </View>
        </View>

        <View style={styles.preview}>
          {camOn ? (
            <CameraView style={StyleSheet.absoluteFill} facing="front" mirror />
          ) : (
            <View style={styles.cameraOff}>
              <View style={styles.selfAvatar}>
                <Text style={styles.selfAvatarText}>{initials(studentName) || 'You'}</Text>
              </View>
              <Text style={styles.cameraOffText}>Your camera is off</Text>
            </View>
          )}

          <View style={styles.previewControls}>
            <CallControl
              label={micOn ? 'Mute microphone' : 'Unmute microphone'}
              off={!micOn}
              onPress={() => setMicOn((v) => !v)}
            >
              {micOn ? <MicIcon color={colors.onPrimary} /> : <MicOffIcon color={colors.danger} />}
            </CallControl>
            <CallControl
              label={camOn ? 'Turn camera off' : 'Turn camera on'}
              off={!camOn}
              onPress={() => setCamOn((v) => !v)}
            >
              {camOn ? (
                <CameraIcon color={colors.onPrimary} />
              ) : (
                <CameraOffIcon color={colors.danger} />
              )}
            </CallControl>
          </View>
        </View>

        <Text style={[type.caption, styles.center]}>
          Find a quiet, private spot. Calls are live only and never recorded.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  permission: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  body: { marginTop: 20, gap: 18 },
  copy: { gap: 8 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#34C27A' },
  statusText: { fontFamily: fonts.bold, fontSize: 15, color: colors.inkMuted },
  preview: {
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.ink,
  },
  cameraOff: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  selfAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfAvatarText: { fontFamily: fonts.heavy, fontSize: 32, color: colors.lavenderInk },
  cameraOffText: { fontFamily: fonts.bold, fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  previewControls: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 16,
  },
});
