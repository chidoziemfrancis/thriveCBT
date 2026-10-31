import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { CheckIcon, LockIcon } from '@/components/icons';
import { SESSIONS } from '@/features/sessions/sessions';
import { colors, fonts, radius } from '@/theme';

const NODE = 32;

function CurrentPulse() {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
      -1
    );
  }, [progress, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - progress.value),
    transform: [{ scale: 1 + progress.value * 0.6 }],
  }));

  return <Animated.View pointerEvents="none" style={[styles.pulse, style]} />;
}

export default function SessionPath({ current }: { current: number }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Your 8 weeks</Text>
        <Text style={styles.meta}>
          {current - 1} of {SESSIONS.length} done
        </Text>
      </View>

      <View style={styles.path} accessibilityLabel={`Session ${current} of ${SESSIONS.length}`}>
        {SESSIONS.map((session, index) => {
          const done = session.id < current;
          const isCurrent = session.id === current;
          return (
            <View key={session.id} style={styles.step}>
              {index > 0 && (
                <View style={[styles.connector, session.id <= current && styles.connectorDone]} />
              )}
              <View style={styles.nodeWrap}>
                {isCurrent && <CurrentPulse />}
                <View
                  style={[styles.node, done && styles.nodeDone, isCurrent && styles.nodeCurrent]}
                >
                  {done ? (
                    <CheckIcon size={14} color={colors.onPrimary} />
                  ) : isCurrent ? (
                    <Text style={styles.nodeCurrentText}>{session.id}</Text>
                  ) : (
                    <LockIcon size={12} color={colors.inkFaint} />
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { fontFamily: fonts.heavy, fontSize: 17, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  path: { flexDirection: 'row', alignItems: 'center' },
  step: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  connector: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.border },
  connectorDone: { backgroundColor: colors.primary },
  nodeWrap: { width: NODE, height: NODE, alignItems: 'center', justifyContent: 'center' },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: { backgroundColor: colors.primary },
  nodeCurrent: { backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.primary },
  nodeCurrentText: { fontFamily: fonts.heavy, fontSize: 14, color: colors.primary },
  pulse: {
    position: 'absolute',
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    backgroundColor: colors.primary,
  },
});
