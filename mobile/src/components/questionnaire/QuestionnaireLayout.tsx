import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChevronLeftIcon } from '@/components/icons';
import SproutMark from '@/components/mascot/SproutMark';
import { colors, fonts, radius } from '@/theme';

import { segmentFill } from './segments';

function Segment({ filled }: { filled: boolean }) {
  const style = useAnimatedStyle(() => ({
    backgroundColor: withTiming(filled ? colors.primaryEdge : colors.border, { duration: 250 }),
  }));
  return <Animated.View style={[styles.segment, style]} />;
}

/**
 * The shared questionnaire frame: Previous, a tinted band naming what's being asked, and a
 * segmented progress bar. Each screen supplies one question as its children.
 */
export default function QuestionnaireLayout({
  heading,
  highlight,
  answered,
  total,
  onPrevious,
  note,
  children,
}: {
  heading: string;
  /** The part of the heading shown in the accent colour, e.g. "last 2 weeks". */
  highlight?: string;
  answered: number;
  total: number;
  onPrevious: () => void;
  note?: string;
  children: React.ReactNode;
}) {
  const [before, after] = highlight ? heading.split(highlight) : [heading, undefined];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous question"
          onPress={onPrevious}
          hitSlop={10}
          style={({ pressed }) => [styles.previous, pressed && { opacity: 0.6 }]}
        >
          <ChevronLeftIcon size={16} color={colors.primaryEdge} />
          <Text style={styles.previousText}>Previous</Text>
        </Pressable>
        <SproutMark width={40} leaf={colors.primary} accent={colors.primaryEdge} />
        <View style={styles.previous} />
      </View>

      <View style={styles.band}>
        <Text style={styles.heading}>
          {before}
          {highlight !== undefined && after !== undefined && (
            <>
              <Text style={styles.highlight}>{highlight}</Text>
              {after}
            </>
          )}
        </Text>
        <View
          style={styles.segments}
          accessibilityRole="progressbar"
          accessibilityLabel={`${answered} of ${total} answered`}
        >
          {segmentFill(answered, total).map((filled, i) => (
            <Segment key={i} filled={filled} />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
        {note && (
          <View style={styles.note}>
            <View style={styles.noteIcon}>
              <Text style={styles.noteIconText}>i</Text>
            </View>
            <Text style={styles.noteText}>{note}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  previous: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 90 },
  previousText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryEdge },
  band: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 29,
    color: colors.ink,
    textAlign: 'center',
  },
  highlight: { color: colors.primary },
  segments: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 6, borderRadius: radius.pill },
  body: { flex: 1 },
  bodyContent: { padding: 22, paddingTop: 28, gap: 22, flexGrow: 1 },
  note: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  noteIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.mintInk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteIconText: { fontFamily: fonts.bold, fontSize: 13, color: colors.mintInk },
  noteText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.mintInk,
  },
});
