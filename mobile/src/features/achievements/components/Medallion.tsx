import { useId } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { Glyph, TONES } from '@/components/icons/FeatureIcon';
import { LockIcon } from '@/components/icons';
import type { AchievementDef, TierName } from '@/features/achievements/achievements';
import { TIER_NAMES } from '@/features/achievements/achievements';
import { colors, fonts } from '@/theme';

type Metal = { light: string; dark: string; pill: string };

// Rims go from the app's teal to bronze, silver and gold, like GitHub's tiered achievements.
export const METALS: Record<TierName | 'locked', Metal> = {
  base: { light: '#6FD6C1', dark: colors.primaryEdge, pill: colors.primary },
  bronze: { light: '#F2BC94', dark: '#8E5230', pill: '#B86E40' },
  silver: { light: '#F4F7FA', dark: '#7F8B96', pill: '#8E9AA6' },
  gold: { light: '#FFE69A', dark: '#B98314', pill: '#D39A1A' },
  locked: { light: '#F1ECE3', dark: '#CBC2B4', pill: colors.inkFaint },
};

export default function Medallion({
  def,
  tier,
  size = 80,
}: {
  def: AchievementDef;
  /** Null while locked. */
  tier: TierName | null;
  size?: number;
}) {
  // Gradient ids are global on web, so each medallion needs its own.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const locked = tier === null;
  const metal = METALS[tier ?? 'locked'];
  const tone = TONES[def.tone];
  const level = tier ? TIER_NAMES.indexOf(tier) + 1 : 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id={`rim${uid}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={metal.light} />
            <Stop offset="1" stopColor={metal.dark} />
          </LinearGradient>
          <LinearGradient id={`bevel${uid}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={metal.dark} />
            <Stop offset="1" stopColor={metal.light} />
          </LinearGradient>
          <LinearGradient id={`disc${uid}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.surface} />
            <Stop offset="1" stopColor={locked ? colors.surfaceMuted : tone.bg} />
          </LinearGradient>
        </Defs>

        <Circle cx={50} cy={53} r={46} fill="#000000" fillOpacity={0.08} />
        <Circle cx={50} cy={50} r={47} fill={`url(#rim${uid})`} />
        <Circle cx={50} cy={50} r={39.5} fill={`url(#bevel${uid})`} />
        <Circle cx={50} cy={50} r={37} fill={`url(#disc${uid})`} />
        <Circle
          cx={50}
          cy={50}
          r={31}
          fill="none"
          stroke={locked ? colors.border : tone.ink}
          strokeOpacity={0.25}
          strokeWidth={1.2}
          strokeDasharray="2 3"
        />
        {/* Highlight along the top-left of the rim. */}
        <Path
          d="M14 42 A37 37 0 0 1 42 13"
          stroke="#FFFFFF"
          strokeOpacity={locked ? 0.4 : 0.55}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>

      <View style={styles.glyph} pointerEvents="none">
        <Glyph
          name={def.icon}
          size={Math.round(size * 0.36)}
          color={locked ? colors.inkFaint : tone.ink}
        />
      </View>

      {locked ? (
        <View style={[styles.pill, styles.lockPill, pillSize(size)]}>
          <LockIcon size={Math.round(size * 0.13)} color={colors.onPrimary} />
        </View>
      ) : (
        level > 1 && (
          <View style={[styles.pill, { backgroundColor: metal.pill }, pillSize(size)]}>
            <Text style={[styles.pillText, { fontSize: Math.max(10, size * 0.14) }]}>×{level}</Text>
          </View>
        )
      )}
    </View>
  );
}

function pillSize(size: number) {
  return { minWidth: size * 0.34, height: size * 0.26, borderRadius: size * 0.13 };
}

const styles = StyleSheet.create({
  glyph: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    right: -2,
    bottom: 0,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  lockPill: { backgroundColor: colors.inkFaint },
  pillText: { fontFamily: fonts.heavy, color: colors.onPrimary },
});
