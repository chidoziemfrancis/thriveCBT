import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { CheckIcon } from '@/components/icons';
import TextField from '@/components/ui/TextField';
import {
  STRENGTH_LABELS,
  isPasswordValid,
  passwordChecks,
  passwordStrength,
} from '@/features/auth/password';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

const STRENGTH_COLORS = [colors.border, '#C98A12', colors.primary, colors.primaryEdge];

function StrengthBar({ strength }: { strength: number }) {
  return (
    <View style={styles.meter}>
      {[1, 2, 3].map((level) => (
        <Segment key={level} filled={strength >= level} color={STRENGTH_COLORS[strength]} />
      ))}
    </View>
  );
}

function Segment({ filled, color }: { filled: boolean; color: string }) {
  const style = useAnimatedStyle(() => ({
    backgroundColor: withTiming(filled ? color : colors.surfaceMuted, { duration: 220 }),
  }));
  return <Animated.View style={[styles.segment, style]} />;
}

export default function NewPasswordField({
  value,
  onChange,
  onSubmit,
  label = 'Password',
  autoFocus,
}: {
  value: string;
  onChange: (password: string) => void;
  onSubmit?: () => void;
  label?: string;
  autoFocus?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const checks = passwordChecks(value);
  const strength = passwordStrength(value);

  function handleChange(next: string) {
    if (!isPasswordValid(value) && isPasswordValid(next)) haptics.tick();
    onChange(next);
  }

  return (
    <View style={styles.field}>
      <View>
        <TextField
          label={label}
          value={value}
          onChangeText={handleChange}
          secureTextEntry={!visible}
          autoComplete="new-password"
          textContentType="newPassword"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          returnKeyType="go"
          onSubmitEditing={onSubmit}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          onPress={() => setVisible((v) => !v)}
          style={styles.toggle}
          hitSlop={8}
        >
          <Text style={styles.toggleLabel}>{visible ? 'Hide' : 'Show'}</Text>
        </Pressable>
      </View>

      <View
        style={styles.strengthRow}
        accessibilityLabel={`Strength: ${STRENGTH_LABELS[strength]}`}
      >
        <StrengthBar strength={strength} />
        <Text style={[styles.strengthLabel, { color: strength ? colors.ink : colors.inkFaint }]}>
          {STRENGTH_LABELS[strength]}
        </Text>
      </View>

      <View style={styles.checks}>
        {checks.map(({ label: check, met }) => (
          <View
            key={check}
            style={styles.check}
            accessibilityLabel={`${check}, ${met ? 'done' : 'not yet'}`}
          >
            <View style={[styles.checkDot, met && styles.checkDotMet]}>
              {met && <CheckIcon size={11} color={colors.onPrimary} />}
            </View>
            <Text style={[styles.checkLabel, met && { color: colors.ink }]}>{check}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 20 },
  input: { paddingRight: 72 },
  toggle: { position: 'absolute', right: 18, bottom: 19 },
  toggleLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  meter: { flex: 1, flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 8, borderRadius: radius.pill },
  strengthLabel: { fontFamily: fonts.bold, fontSize: 14, minWidth: 70, textAlign: 'right' },
  checks: { gap: 10 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDotMet: { borderColor: colors.primary, backgroundColor: colors.primary },
  checkLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.inkMuted },
});
