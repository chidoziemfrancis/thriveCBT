import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/icons';
import FeatureIcon, { type FeatureIconName } from '@/components/icons/FeatureIcon';
import BackButton from '@/components/ui/BackButton';
import Screen from '@/components/ui/Screen';
import { EXERCISES, type Exercise } from '@/features/coping/utils/coping';
import { haptics } from '@/lib/haptics';
import { colors, fonts, type } from '@/theme';

const ICONS: Record<Exercise, FeatureIconName> = { box: 'sun', muscle: 'heart', grounding: 'eye' };

/** The three guided exercises from Session 6, any time. */
export default function RelaxScreen() {
  return (
    <Screen>
      <BackButton />
      <View style={styles.header}>
        <Text style={type.title}>Relax</Text>
        <Text style={styles.meta}>A few minutes to settle your body when stress builds up.</Text>
      </View>
      <View style={styles.list}>
        {EXERCISES.map((e, i) => (
          <Pressable
            key={e.id}
            accessibilityRole="button"
            onPress={() => {
              haptics.tick();
              router.push(`/relax/${e.id}`);
            }}
            style={({ pressed }) => [
              styles.row,
              i > 0 && styles.divider,
              pressed && { opacity: 0.6 },
            ]}
          >
            <FeatureIcon name={ICONS[e.id]} size={44} tone="mint" />
            <View style={styles.text}>
              <Text style={styles.title}>{e.title}</Text>
              <Text style={styles.detail}>
                {e.detail} · {e.minutes} min
              </Text>
            </View>
            <ChevronRightIcon size={16} color={colors.inkFaint} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, marginTop: 16 },
  meta: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  list: { marginTop: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  detail: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.inkMuted },
});
