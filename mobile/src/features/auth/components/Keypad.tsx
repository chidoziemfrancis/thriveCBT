import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BackspaceIcon } from '@/components/icons';
import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

const KEY = 76;
const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

function Key({
  label,
  accessibilityLabel,
  onPress,
  disabled,
  children,
}: {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={() => {
        haptics.tick();
        onPress();
      }}
      style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
    >
      {children ?? <Text style={styles.digit}>{label}</Text>}
    </Pressable>
  );
}

/** A phone-style number pad, so PIN entry never depends on the system keyboard. */
export default function Keypad({
  onDigit,
  onDelete,
  disabled,
}: {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.pad}>
      {ROWS.map((row) => (
        <View key={row.join('')} style={styles.row}>
          {row.map((digit) => (
            <Key key={digit} label={digit} disabled={disabled} onPress={() => onDigit(digit)} />
          ))}
        </View>
      ))}
      <View style={styles.row}>
        <View style={styles.key} />
        <Key label="0" disabled={disabled} onPress={() => onDigit('0')} />
        <Key label="delete" accessibilityLabel="Delete" disabled={disabled} onPress={onDelete}>
          <BackspaceIcon color={colors.ink} />
        </Key>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  key: {
    width: KEY,
    height: KEY,
    borderRadius: KEY / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: { backgroundColor: colors.surfaceMuted },
  digit: { fontFamily: fonts.medium, fontSize: 30, color: colors.ink },
});
