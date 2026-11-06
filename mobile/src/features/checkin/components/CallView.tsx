import { CameraType, useCameraPermissions } from 'expo-camera';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CameraIcon,
  CameraOffIcon,
  EndCallIcon,
  FlipCameraIcon,
  MicIcon,
  MicOffIcon,
} from '@/components/icons';
import { formatDuration } from '@/features/checkin/checkinLogic';
import CallControl from '@/features/checkin/components/CallControl';
import SelfView from '@/features/checkin/components/SelfView';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

const CALL_BACKGROUND = '#0E2B27';
export const CALL_AVATAR = 132;
const AVATAR = CALL_AVATAR;

/** Soft rings around the researcher while their video isn't connected, so the call feels live. */
function SpeakingRing({ delay }: { delay: number }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setTimeout(() => {
      progress.set(
        withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1)
      );
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, progress, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 * (1 - progress.value),
    transform: [{ scale: 1 + progress.value * 0.7 }],
  }));

  return <Animated.View style={[styles.ring, style]} />;
}

export default function CallView({
  name,
  photo,
  status,
  connected = true,
  topRight,
  selfInitials,
  micStartsOn = true,
  camStartsOn = true,
  onEnd,
}: {
  name: string;
  photo: React.ReactNode;
  status: string;
  connected?: boolean;
  topRight?: React.ReactNode;
  selfInitials: string;
  micStartsOn?: boolean;
  camStartsOn?: boolean;
  onEnd: (seconds: number) => void;
}) {
  useKeepAwake();
  const [camera, requestCamera] = useCameraPermissions();
  const [micOn, setMicOn] = useState(micStartsOn);
  const [camOn, setCamOn] = useState(camStartsOn);
  const [facing, setFacing] = useState<CameraType>('front');
  const [seconds, setSeconds] = useState(0);
  const startedAt = useRef(0);

  useEffect(() => {
    if (camera && !camera.granted && camera.canAskAgain) requestCamera();
  }, [camera, requestCamera]);

  // Counted from a fixed start time so the timer stays accurate if a tick is delayed.
  useEffect(() => {
    if (!connected) return;
    startedAt.current = Date.now();
    haptics.success();
    const timer = setInterval(
      () => setSeconds(Math.floor((Date.now() - startedAt.current) / 1000)),
      1000
    );
    return () => clearInterval(timer);
  }, [connected]);

  function endCall() {
    haptics.tap();
    onEnd(seconds);
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.remote}>
        <View style={styles.avatarWrap}>
          {connected && <SpeakingRing delay={0} />}
          {connected && <SpeakingRing delay={1100} />}
          <View style={[styles.avatar, !connected && styles.avatarWaiting]}>{photo}</View>
        </View>
        <Text style={styles.remoteName}>{name}</Text>
        <Text style={styles.remoteNote} accessibilityLiveRegion="polite">
          {status}
        </Text>
      </View>

      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']} pointerEvents="box-none">
        <View style={styles.topBar}>
          {connected ? (
            <View style={styles.timer} accessibilityLabel={`Call time ${formatDuration(seconds)}`}>
              <View style={styles.liveDot} />
              <Text style={styles.timerText}>{formatDuration(seconds)}</Text>
            </View>
          ) : (
            <View style={styles.timer}>
              <View style={[styles.liveDot, styles.waitingDot]} />
              <Text style={styles.timerText}>Waiting</Text>
            </View>
          )}
          {topRight}
        </View>

        <View style={styles.controls}>
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
          <CallControl
            label="Switch camera"
            onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
          >
            <FlipCameraIcon color={colors.onPrimary} />
          </CallControl>
          <CallControl label="End call" danger size={64} onPress={endCall}>
            <EndCallIcon color={colors.onPrimary} />
          </CallControl>
        </View>
      </SafeAreaView>

      <SelfView cameraOn={camOn && !!camera?.granted} facing={facing} initials={selfInitials} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: CALL_BACKGROUND },
  remote: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    width: AVATAR * 1.8,
    height: AVATAR * 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.primary,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarWaiting: { opacity: 0.6 },
  remoteName: { fontFamily: fonts.heavy, fontSize: 24, color: colors.onPrimary, marginTop: 8 },
  remoteNote: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
  },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C27A' },
  waitingDot: { backgroundColor: 'rgba(255,255,255,0.5)' },
  timerText: { fontFamily: fonts.bold, fontSize: 15, color: colors.onPrimary },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 16,
  },
});
