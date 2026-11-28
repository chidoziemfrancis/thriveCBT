import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon, PlusIcon } from '@/components/icons';
import FeatureIcon from '@/components/icons/FeatureIcon';
import { COPING_GROUPS, type CopingCard } from '@/features/coping/utils/coping';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

/** A coping idea with a Save toggle for the toolkit. */
export default function CopingCardRow({
  card,
  saved,
  onToggle,
  children,
}: {
  card: CopingCard;
  saved: boolean;
  onToggle: () => void;
  /** Extra actions under the text, e.g. Try it. */
  children?: React.ReactNode;
}) {
  const tone = COPING_GROUPS.find((g) => g.id === card.group)?.tone ?? 'mint';
  return (
    <View style={styles.row}>
      <FeatureIcon name={card.icon} size={40} tone={tone} />
      <View style={styles.text}>
        <Text style={styles.title}>{card.title}</Text>
        <Text style={styles.how}>{card.how}</Text>
        {children}
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: saved }}
        accessibilityLabel={saved ? `${card.title}, saved to toolkit` : `Save ${card.title}`}
        hitSlop={8}
        onPress={() => {
          haptics.tick();
          onToggle();
        }}
        style={[styles.save, saved && styles.saved]}
      >
        {saved ? (
          <CheckIcon size={13} color={colors.onPrimary} />
        ) : (
          <PlusIcon size={14} color={colors.primary} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  text: { flex: 1, gap: 3 },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  how: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.inkMuted },
  save: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saved: { backgroundColor: colors.primary },
});
