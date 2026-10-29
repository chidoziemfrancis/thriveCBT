import { CameraType, CameraView } from 'expo-camera';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radius } from '@/theme';

const WIDTH = 108;
const HEIGHT = 152;
const MARGIN = 16;
// Clear of the top bar and the bottom controls.
const TOP_CLEARANCE = 72;
const BOTTOM_CLEARANCE = 140;
const SPRING = { damping: 18, stiffness: 180 };

/** The student's own camera in a small window they can drag; it settles into the nearest corner. */
export default function SelfView({
  cameraOn,
  facing,
  initials,
}: {
  cameraOn: boolean;
  facing: CameraType;
  initials: string;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const left = MARGIN;
  const right = width - WIDTH - MARGIN;
  const top = insets.top + TOP_CLEARANCE;
  const bottom = height - insets.bottom - BOTTOM_CLEARANCE - HEIGHT;

  const x = useSharedValue(right);
  const y = useSharedValue(top);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const pan = usePanGesture({
    onBegin: () => {
      'worklet';
      startX.set(x.get());
      startY.set(y.get());
    },
    onUpdate: (event) => {
      'worklet';
      x.set(startX.get() + event.translationX);
      y.set(startY.get() + event.translationY);
    },
    onFinalize: () => {
      'worklet';
      const centreX = x.get() + WIDTH / 2;
      const centreY = y.get() + HEIGHT / 2;
      x.set(withSpring(centreX < width / 2 ? left : right, SPRING));
      y.set(withSpring(centreY < (top + bottom + HEIGHT) / 2 ? top : bottom, SPRING));
    },
  });

  const position = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.window, position]}
        accessibilityLabel={cameraOn ? 'Your camera' : 'Your camera is off'}
      >
        {cameraOn ? (
          <CameraView style={StyleSheet.absoluteFill} facing={facing} mirror={facing === 'front'} />
        ) : (
          <View style={styles.off}>
            <Text style={styles.initials}>{initials || 'You'}</Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  window: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: WIDTH,
    height: HEIGHT,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: colors.ink,
  },
  off: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: fonts.heavy, fontSize: 26, color: colors.onPrimary },
});
