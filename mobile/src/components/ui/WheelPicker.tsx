import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

export const WHEEL_ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const PADDING_ROWS = (VISIBLE_ROWS - 1) / 2;

function WheelItem({
  label,
  index,
  offset,
}: {
  label: string;
  index: number;
  offset: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const distance = offset.value / WHEEL_ITEM_HEIGHT - index;
    return {
      opacity: interpolate(Math.abs(distance), [0, 1, 2], [1, 0.45, 0.18], Extrapolation.CLAMP),
      transform: [
        { perspective: 600 },
        { rotateX: `${interpolate(distance, [-2, 0, 2], [40, 0, -40], Extrapolation.CLAMP)}deg` },
        { scale: interpolate(Math.abs(distance), [0, 2], [1, 0.9], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View style={[styles.item, style]}>
      <Animated.Text style={styles.itemText} numberOfLines={1}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

/**
 * One iOS-style wheel column. Scrolls freely, snaps to a row, ticks a haptic as each row
 * crosses the centre, and reports the settled row through onChange.
 */
export default function WheelPicker({
  items,
  index,
  onChange,
  onTouch,
  accessibilityLabel,
  flex = 1,
}: {
  items: string[];
  index: number;
  onChange: (index: number) => void;
  onTouch?: () => void;
  accessibilityLabel: string;
  flex?: number;
}) {
  const scrollRef = useRef<Animated.ScrollView>(null);
  const offset = useSharedValue(index * WHEEL_ITEM_HEIGHT);
  const centred = useSharedValue(index);
  const lastIndex = items.length - 1;

  function settle(next: number) {
    const clamped = Math.min(Math.max(next, 0), lastIndex);
    if (clamped !== index) onChange(clamped);
  }

  const onScroll = useAnimatedScrollHandler({
    onBeginDrag: () => {
      if (onTouch) scheduleOnRN(onTouch);
    },
    onScroll: (event) => {
      offset.value = event.contentOffset.y;
      const row = Math.round(event.contentOffset.y / WHEEL_ITEM_HEIGHT);
      if (row !== centred.value && row >= 0 && row <= lastIndex) {
        centred.value = row;
        scheduleOnRN(haptics.tick);
      }
    },
    onMomentumEnd: (event) => {
      scheduleOnRN(settle, Math.round(event.contentOffset.y / WHEEL_ITEM_HEIGHT));
    },
    onEndDrag: (event) => {
      // A slow release can stop exactly on a row without any momentum phase.
      if (Math.abs(event.velocity?.y ?? 0) < 0.05) {
        scheduleOnRN(settle, Math.round(event.contentOffset.y / WHEEL_ITEM_HEIGHT));
      }
    },
  });

  // Follow index changes made from outside, such as the day rolling back after a month change.
  useEffect(() => {
    if (Math.round(offset.value / WHEEL_ITEM_HEIGHT) !== index) {
      scrollRef.current?.scrollTo({ y: index * WHEEL_ITEM_HEIGHT, animated: true });
    }
  }, [index, offset]);

  return (
    <View
      style={[styles.column, { flex }]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: items[index] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={({ nativeEvent }) => {
        onTouch?.();
        settle(nativeEvent.actionName === 'increment' ? index + 1 : index - 1);
      }}
    >
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled
        contentOffset={{ x: 0, y: index * WHEEL_ITEM_HEIGHT }}
        contentContainerStyle={styles.content}
        importantForAccessibility="no-hide-descendants"
      >
        {items.map((label, i) => (
          <WheelItem key={label} label={label} index={i} offset={offset} />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

export const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * VISIBLE_ROWS;

const styles = StyleSheet.create({
  column: { height: WHEEL_HEIGHT },
  content: { paddingVertical: WHEEL_ITEM_HEIGHT * PADDING_ROWS },
  item: { height: WHEEL_ITEM_HEIGHT, justifyContent: 'center', paddingHorizontal: 8 },
  itemText: { fontFamily: fonts.medium, fontSize: 20, color: colors.ink, textAlign: 'center' },
});
