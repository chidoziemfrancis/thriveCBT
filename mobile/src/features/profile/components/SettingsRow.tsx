import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/icons';
import Icon3D from '@/components/icons/Icon3D';
import type { Icon3DName } from '@/components/icons/icon3dSources';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

type Base = { label: string; detail?: string; image?: Icon3DName; icon?: React.ReactNode };

type Props =
  | (Base & { kind?: 'link'; onPress: () => void; danger?: boolean })
  | (Base & { kind: 'toggle'; value: boolean; onChange: (value: boolean) => void })
  | (Base & { kind: 'static' });

export function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

export default function SettingsRow(props: Props) {
  const lead = (props.image || props.icon) && (
    <View style={styles.lead}>
      {props.image ? <Icon3D name={props.image} size={24} /> : props.icon}
    </View>
  );
  const danger = props.kind !== 'toggle' && props.kind !== 'static' && props.danger;
  const text = (
    <View style={styles.text}>
      <Text style={[styles.label, danger && { color: colors.danger }]}>{props.label}</Text>
      {props.detail && <Text style={styles.detail}>{props.detail}</Text>}
    </View>
  );

  if (props.kind === 'toggle') {
    return (
      <View style={styles.row}>
        {lead}
        {text}
        <Switch
          accessibilityLabel={props.label}
          value={props.value}
          onValueChange={(value) => {
            props.onChange(value);
            haptics.tick();
          }}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </View>
    );
  }

  if (props.kind === 'static') {
    return (
      <View
        style={styles.row}
        accessible
        accessibilityLabel={`${props.label}, ${props.detail ?? ''}`}
      >
        {lead}
        {text}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceMuted }]}
    >
      {lead}
      {text}
      <ChevronRightIcon color={danger ? colors.danger : colors.inkFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  groupTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginLeft: 4,
  },
  groupCard: {
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  lead: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  label: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  detail: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkMuted },
});
