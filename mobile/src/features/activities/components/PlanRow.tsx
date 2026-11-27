import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon, CloseIcon } from '@/components/icons';
import FeatureIcon from '@/components/icons/FeatureIcon';
import { activityIcon } from '@/features/activities/utils/activities';
import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

/** One planned activity: tick it off with `onCheck`, or take it off the plan with `onRemove`. */
export default function PlanRow({
  label,
  meta,
  done,
  open,
  onCheck,
  onRemove,
}: {
  label: string;
  meta?: string;
  done?: boolean;
  /** Its rating panel is showing. */
  open?: boolean;
  onCheck?: () => void;
  onRemove?: () => void;
}) {
  return (
    <View style={styles.row}>
      {onCheck ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done, expanded: open }}
          accessibilityLabel={done ? `${label}, done` : `Mark ${label} as done`}
          disabled={done}
          hitSlop={6}
          onPress={() => {
            haptics.tick();
            onCheck();
          }}
          style={[
            styles.check,
            (done || open) && styles.checkOn,
            open && !done && styles.checkOpen,
          ]}
        >
          {done && <CheckIcon size={13} color={colors.onPrimary} />}
        </Pressable>
      ) : (
        <FeatureIcon name={activityIcon(label)} size={34} tone="mint" />
      )}
      <View style={styles.text}>
        <Text style={[styles.label, done && styles.labelDone]}>{label}</Text>
        {meta && <Text style={styles.meta}>{meta}</Text>}
      </View>
      {onRemove && !done && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          hitSlop={10}
          onPress={() => {
            haptics.tick();
            onRemove();
          }}
          style={styles.remove}
        >
          <CloseIcon size={14} color={colors.inkFaint} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  checkOpen: { backgroundColor: colors.primarySoft },
  text: { flex: 1, gap: 2 },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  labelDone: { color: colors.inkMuted },
  meta: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted },
  remove: { padding: 4 },
});
