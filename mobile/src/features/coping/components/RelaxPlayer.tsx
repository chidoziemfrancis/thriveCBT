import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { CheckIcon } from '@/components/icons';
import { type Exercise, STRESS_SPOTS } from '@/features/coping/utils/coping';
import BodyFigure, { FIGURE } from '@/features/sessions/art/BodyFigure';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

type Timer = ReturnType<typeof setTimeout>;

/** setTimeout that's cleared when the screen closes, so a half-done exercise never fires late. */
function useTimers() {
  const timers = useRef<Timer[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return {
    after(ms: number, fn: () => void) {
      timers.current.push(setTimeout(fn, ms));
    },
    clear() {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
  };
}

function StartButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.start, pressed && { opacity: 0.8 }]}
    >
      <Text style={styles.startText}>{label}</Text>
    </Pressable>
  );
}

const SIDE = 200;
const DOT = 22;
const BOX = [
  { label: 'Breathe in', to: { x: 0, y: 0 } },
  { label: 'Hold', to: { x: SIDE, y: 0 } },
  { label: 'Breathe out', to: { x: SIDE, y: SIDE } },
  { label: 'Hold', to: { x: 0, y: SIDE } },
];
const BOX_MS = 4000;
const BOX_CYCLES = 4;

// A dot travels round a square, one side per four counts.
function BoxBreathing({ done, onDone }: { done: boolean; onDone: () => void }) {
  const timers = useTimers();
  const [step, setStep] = useState<number | null>(null);
  const x = useSharedValue(0);
  const y = useSharedValue(SIDE);
  const dot = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() - DOT / 2 }, { translateY: y.get() - DOT / 2 }],
  }));

  function run(i: number) {
    if (i >= BOX.length * BOX_CYCLES) {
      setStep(null);
      haptics.success();
      onDone();
      return;
    }
    const phase = BOX[i % BOX.length];
    setStep(i);
    haptics.tick();
    x.set(withTiming(phase.to.x, { duration: BOX_MS, easing: Easing.linear }));
    y.set(withTiming(phase.to.y, { duration: BOX_MS, easing: Easing.linear }));
    timers.after(BOX_MS, () => run(i + 1));
  }

  return (
    <View style={styles.center}>
      <View style={styles.box}>
        <View style={styles.square} />
        <Animated.View style={[styles.dot, dot]} />
        <View style={styles.boxLabel} accessibilityLiveRegion="polite">
          <Text style={styles.phase}>
            {step !== null ? BOX[step % BOX.length].label : done ? 'Well done' : 'Ready?'}
          </Text>
          {step !== null && (
            <Text style={styles.count}>
              {Math.floor(step / BOX.length) + 1} of {BOX_CYCLES}
            </Text>
          )}
        </View>
      </View>
      {step === null ? (
        <StartButton label={done ? 'Go again' : 'Start'} onPress={() => run(0)} />
      ) : (
        <StartButton
          label="Stop"
          onPress={() => {
            timers.clear();
            setStep(null);
          }}
        />
      )}
    </View>
  );
}

const MUSCLES = [
  { spot: 'hands', name: 'Hands', tense: 'Make tight fists.' },
  { spot: 'shoulders', name: 'Shoulders', tense: 'Lift your shoulders up to your ears.' },
  { spot: 'head', name: 'Face', tense: 'Scrunch up your whole face.' },
  { spot: 'stomach', name: 'Stomach', tense: 'Pull your stomach in tight.' },
  { spot: 'legs', name: 'Legs and feet', tense: 'Point your toes and tighten your legs.' },
] as const;
const TENSE_MS = 5000;
const RELEASE_MS = 8000;

function Glow({ tense }: { tense: boolean }) {
  const reduce = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduce) t.set(withRepeat(withTiming(1, { duration: tense ? 500 : 1800 }), -1, true));
  }, [reduce, t, tense]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 0.8 + t.get() * 0.4 }] }));
  return (
    <Animated.View
      style={[styles.glow, { backgroundColor: tense ? colors.peach : colors.mint }, style]}
    />
  );
}

// Tense one part for a few seconds, then let it go, so the student feels the difference.
function MuscleRelaxation({ done, onDone }: { done: boolean; onDone: () => void }) {
  const timers = useTimers();
  const [at, setAt] = useState<{ part: number; tense: boolean } | null>(null);

  function run(part: number) {
    if (part >= MUSCLES.length) {
      setAt(null);
      haptics.success();
      onDone();
      return;
    }
    setAt({ part, tense: true });
    haptics.tap();
    timers.after(TENSE_MS, () => {
      setAt({ part, tense: false });
      haptics.tick();
      timers.after(RELEASE_MS, () => run(part + 1));
    });
  }

  const current = at ? MUSCLES[at.part] : null;
  const spot = current ? STRESS_SPOTS.find((s) => s.id === current.spot) : null;

  return (
    <View style={styles.center}>
      <View style={styles.figure}>
        <BodyFigure color={colors.primary} fill={colors.primarySoft} />
        {spot && at && (
          <View
            style={[
              styles.glowWrap,
              { left: spot.x * FIGURE.width - 30, top: spot.y * FIGURE.height - 30 },
            ]}
          >
            <Glow key={`${at.part}-${at.tense}`} tense={at.tense} />
          </View>
        )}
      </View>
      <View style={styles.say} accessibilityLiveRegion="polite">
        {current && at ? (
          <Animated.View key={`${at.part}-${at.tense}`} entering={FadeIn.duration(300)}>
            <Text style={styles.phase}>
              {current.name} · {at.tense ? 'tense' : 'let go'}
            </Text>
            <Text style={styles.line}>
              {at.tense ? current.tense : 'Let it all go. Notice how different it feels.'}
            </Text>
          </Animated.View>
        ) : (
          <Text style={styles.phase}>{done ? 'Well done' : 'Five parts, about a minute'}</Text>
        )}
      </View>
      {at === null ? (
        <StartButton label={done ? 'Go again' : 'Start'} onPress={() => run(0)} />
      ) : (
        <StartButton
          label="Stop"
          onPress={() => {
            timers.clear();
            setAt(null);
          }}
        />
      )}
    </View>
  );
}

const SENSES = [
  { count: 5, prompt: 'things you can see' },
  { count: 4, prompt: 'things you can feel' },
  { count: 3, prompt: 'things you can hear' },
  { count: 2, prompt: 'things you can smell' },
  { count: 1, prompt: 'thing you can taste' },
];

// Name things around you, one sense at a time, tapping as each one is found.
function Grounding({ done, onDone }: { done: boolean; onDone: () => void }) {
  const timers = useTimers();
  const [sense, setSense] = useState(done ? SENSES.length : 0);
  const [found, setFound] = useState(0);
  const current = SENSES[sense];

  function tap() {
    if (!current || found >= current.count) return;
    haptics.tap();
    const next = found + 1;
    setFound(next);
    if (next < current.count) return;
    timers.after(500, () => {
      if (sense + 1 >= SENSES.length) {
        haptics.success();
        setSense(SENSES.length);
        onDone();
      } else {
        setSense(sense + 1);
        setFound(0);
      }
    });
  }

  if (!current) {
    return (
      <View style={styles.center}>
        <View style={styles.doneMark}>
          <CheckIcon size={30} color={colors.onPrimary} />
        </View>
        <Text style={styles.phase}>You’re back in the room</Text>
        <StartButton
          label="Go again"
          onPress={() => {
            setSense(0);
            setFound(0);
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Animated.View key={sense} entering={FadeIn.duration(300)} style={styles.sense}>
        <Text style={styles.big}>{current.count}</Text>
        <Text style={styles.phase}>Name {current.prompt}</Text>
        <Text style={styles.line}>Say each one in your head, then tap.</Text>
      </Animated.View>
      <View style={styles.pips}>
        {Array.from({ length: current.count }, (_, i) => (
          <View key={i} style={[styles.pip, i < found && styles.pipOn]} />
        ))}
      </View>
      <StartButton label="Found one" onPress={tap} />
    </View>
  );
}

export default function RelaxPlayer({
  exercise,
  done,
  onDone,
}: {
  exercise: Exercise;
  done: boolean;
  onDone: () => void;
}) {
  if (exercise === 'box') return <BoxBreathing done={done} onDone={onDone} />;
  if (exercise === 'muscle') return <MuscleRelaxation done={done} onDone={onDone} />;
  return <Grounding done={done} onDone={onDone} />;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 24, paddingVertical: 8 },
  box: { width: SIDE + DOT, height: SIDE + DOT, padding: DOT / 2 },
  square: {
    width: SIDE,
    height: SIDE,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.mint,
  },
  dot: {
    position: 'absolute',
    left: DOT / 2,
    top: DOT / 2,
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  boxLabel: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  phase: { fontFamily: fonts.heavy, fontSize: 20, color: colors.mintInk, textAlign: 'center' },
  count: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
  line: {
    marginTop: 4,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    textAlign: 'center',
  },
  figure: { width: FIGURE.width, height: FIGURE.height },
  glowWrap: { position: 'absolute', width: 60, height: 60 },
  glow: { width: 60, height: 60, borderRadius: 30, opacity: 0.8 },
  say: { minHeight: 70, paddingHorizontal: 12 },
  sense: { alignItems: 'center', gap: 4 },
  big: { fontFamily: fonts.heavy, fontSize: 64, color: colors.primary },
  doneMark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pips: { flexDirection: 'row', gap: 10 },
  pip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  pipOn: { backgroundColor: colors.primary },
  start: {
    paddingHorizontal: 28,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
  },
  startText: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
});
