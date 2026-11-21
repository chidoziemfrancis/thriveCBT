import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { CONSENT_STATEMENTS } from '@/features/consent/consentContent';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

/** The consent statements, each unticked until the participant ticks it themselves. */
export default function ConsentChecklist({
  ticked,
  onChange,
}: {
  ticked: boolean[];
  onChange: (ticked: boolean[]) => void;
}) {
  return (
    <View style={styles.list}>
      {CONSENT_STATEMENTS.map((statement, index) => {
        const checked = ticked[index] ?? false;
        return (
          <Pressable
            key={statement}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            onPress={() => {
              haptics.tick();
              onChange(CONSENT_STATEMENTS.map((_, i) => (i === index ? !checked : !!ticked[i])));
            }}
            style={({ pressed }) => [
              styles.row,
              checked && styles.rowChecked,
              pressed && { transform: [{ scale: 0.99 }] },
            ]}
          >
            <View style={[styles.box, checked && styles.boxChecked]}>
              {checked && <CheckIcon size={13} color={colors.onPrimary} />}
            </View>
            <Text style={styles.statement}>{statement}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const noneTicked = () => CONSENT_STATEMENTS.map(() => false);

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowChecked: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  box: {
    width: 24,
    height: 24,
    marginTop: 1,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { borderColor: colors.primary, backgroundColor: colors.primary },
  statement: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink },
});
