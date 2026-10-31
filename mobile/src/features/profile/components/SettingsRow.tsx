import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/icons';
import { Glyph } from '@/components/icons/FeatureIcon';
import type { FeatureIconName } from '@/components/icons/FeatureIcon';
import { haptics } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

type Base = {
  label: string;
  /** A second line under the label, for explanations. */
  detail?: string;
  /** A short value shown on the right, like an email or a date. */
  value?: string;
  icon?: FeatureIconName;
};

type Props =
  | (Base & {
      kind?: 'link';
      onPress: () => void;
      danger?: boolean;
      /** Shown as a text link (e.g. "Edit") instead of a chevron. */
      action?: string;
    })
  | (Base & { kind: 'toggle'; value?: undefined; on: boolean; onChange: (on: boolean) => void })
  | (Base & { kind: 'static' })
  | (Base & { kind: 'highlight'; onPress: () => void });

/**
 * A group of rows on the page itself, not in a card. Groups are split by a full-width hairline,
 * so the page reads as one calm list.
 */
export function SettingsGroup({
  title,
  first,
  children,
}: {
  title?: string;
  /** The first group on a screen has no line above it. */
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View>
      {!first && <View style={styles.divider} />}
      {title && <Text style={styles.groupTitle}>{title}</Text>}
      {children}
    </View>
  );
}

export default function SettingsRow(props: Props) {
  const danger =
    props.kind !== 'toggle' && props.kind !== 'static' && props.kind !== 'highlight'
      ? props.danger
      : false;
  const highlight = props.kind === 'highlight';
  const ink = danger ? colors.danger : highlight ? colors.primary : colors.ink;

  const lead = props.icon && <Glyph name={props.icon} size={23} color={ink} />;
  const text = (
    <View style={styles.text}>
      <Text style={[styles.label, { color: ink }, highlight && styles.labelStrong]}>
        {props.label}
      </Text>
      {props.detail && <Text style={styles.detail}>{props.detail}</Text>}
    </View>
  );
  const value = props.value ? (
    <Text style={styles.value} numberOfLines={1}>
      {props.value}
    </Text>
  ) : null;

  if (props.kind === 'toggle') {
    return (
      <View style={styles.row}>
        {lead}
        {text}
        <Switch
          accessibilityLabel={props.label}
          value={props.on}
          onValueChange={(on) => {
            props.onChange(on);
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
        accessibilityLabel={[props.label, props.value, props.detail].filter(Boolean).join(', ')}
      >
        {lead}
        {text}
        {value}
      </View>
    );
  }

  const trailing =
    props.kind !== 'highlight' && props.action ? (
      <Text style={styles.action}>{props.action}</Text>
    ) : (
      <ChevronRightIcon
        color={danger ? colors.danger : highlight ? colors.primary : colors.inkFaint}
      />
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[props.label, props.value].filter(Boolean).join(', ')}
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.row,
        highlight && styles.highlight,
        pressed && { opacity: 0.6 },
      ]}
    >
      {lead}
      {text}
      {value}
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Bleeds past the screen's side padding so the line runs edge to edge.
  divider: { height: 1, marginHorizontal: -24, marginVertical: 10, backgroundColor: colors.border },
  groupTitle: {
    marginTop: 6,
    marginBottom: 2,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkFaint,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 54, paddingVertical: 10 },
  highlight: {
    marginVertical: 4,
    paddingHorizontal: 14,
    marginHorizontal: -6,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  text: { flex: 1, gap: 2 },
  label: { fontFamily: fonts.medium, fontSize: 16, color: colors.ink },
  labelStrong: { fontFamily: fonts.bold },
  detail: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.inkMuted },
  value: { maxWidth: '50%', fontFamily: fonts.regular, fontSize: 15, color: colors.inkFaint },
  action: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
});
