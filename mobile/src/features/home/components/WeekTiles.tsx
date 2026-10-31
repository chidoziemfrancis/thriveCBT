import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ArrowUpRightIcon } from '@/components/icons';
import { FeatureIconName, Glyph } from '@/components/icons/FeatureIcon';
import { colors, fonts, radius } from '@/theme';

type Tile = {
  key: string;
  eyebrow: string;
  title: string;
  icon: FeatureIconName;
  bg: string;
  ink: string;
  /** 0 to 1, shown as a thin bar when given. */
  progress?: number;
  footnote?: string;
  onPress: () => void;
};

function TileView({ tile }: { tile: Tile }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tile.eyebrow}. ${tile.title}`}
      onPress={tile.onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: tile.bg },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      {/* A big faint drawing in the corner gives each tile its own character. */}
      <View style={styles.art} pointerEvents="none">
        <Glyph name={tile.icon} size={110} color={tile.ink} />
      </View>

      <View style={styles.top}>
        <Text style={[styles.eyebrow, { color: tile.ink }]}>{tile.eyebrow}</Text>
        <View style={styles.arrow}>
          <ArrowUpRightIcon size={16} color={colors.ink} />
        </View>
      </View>
      <Text style={styles.title} numberOfLines={4}>
        {tile.title}
      </Text>

      <View style={styles.bottom}>
        {tile.progress !== undefined && (
          <View style={styles.track}>
            <View
              style={[styles.fill, { width: `${tile.progress * 100}%`, backgroundColor: tile.ink }]}
            />
          </View>
        )}
        {tile.footnote && <Text style={styles.footnote}>{tile.footnote}</Text>}
      </View>
    </Pressable>
  );
}

export default function WeekTiles({
  sessionId,
  sessionTitle,
  minutes,
  partsDone,
  partsTotal,
  sessionDone,
  prompt,
}: {
  sessionId: number;
  sessionTitle: string;
  minutes: number;
  partsDone: number;
  partsTotal: number;
  sessionDone: boolean;
  prompt: string;
}) {
  const tiles: Tile[] = [
    {
      key: 'session',
      eyebrow: `Session ${sessionId} · ${minutes} min`,
      title: sessionTitle,
      icon: 'book',
      bg: colors.peach,
      ink: colors.peachInk,
      progress: partsTotal ? partsDone / partsTotal : 0,
      footnote: sessionDone
        ? 'Done this week'
        : partsDone > 0
          ? `${partsDone} of ${partsTotal} parts`
          : 'Ready when you are',
      onPress: () => router.push(`/session/${sessionId}`),
    },
    {
      key: 'journal',
      eyebrow: 'Journal',
      title: prompt,
      icon: 'pencil',
      bg: colors.mint,
      ink: colors.mintInk,
      footnote: 'Today’s prompt',
      onPress: () => router.push({ pathname: '/entry/write', params: { prompt } }),
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>This week</Text>
      <View style={styles.row}>
        {tiles.map((tile) => (
          <TileView key={tile.key} tile={tile} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 14 },
  heading: { fontFamily: fonts.heavy, fontSize: 20, color: colors.ink },
  row: { flexDirection: 'row', gap: 12 },
  tile: {
    flex: 1,
    minHeight: 210,
    gap: 8,
    padding: 16,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  art: { position: 'absolute', right: -18, bottom: -14, opacity: 0.16 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  eyebrow: { flex: 1, fontFamily: fonts.bold, fontSize: 12, marginTop: 4 },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.heavy, fontSize: 18, lineHeight: 23, color: colors.ink },
  bottom: { marginTop: 'auto', gap: 8 },
  track: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  footnote: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted },
});
