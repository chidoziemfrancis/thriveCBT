import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { ChatIcon } from '@/components/icons';
import { useChat } from '@/features/chat/chatStore';
import { haptics } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

export const CHAT_BUTTON_SIZE = 60;
const EDGE = 4;

function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}

/** Floating button that opens the researcher chat from any student tab. */
export default function ChatButton({ bottom }: { bottom: number }) {
  const { unread } = useChat();
  const keyboardVisible = useKeyboardVisible();
  const scale = useSharedValue(1);
  const previousUnread = useRef(unread);

  // A little bounce when a new message lands, so it's noticed without a sound.
  useEffect(() => {
    if (unread > previousUnread.current) {
      scale.set(withSequence(withSpring(1.18, { damping: 6 }), withSpring(1, { damping: 8 })));
      haptics.tap();
    }
    previousUnread.current = unread;
  }, [unread, scale]);

  const bounce = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (keyboardVisible) return null;

  const label = unread
    ? `Message your researcher, ${unread} unread message${unread === 1 ? '' : 's'}`
    : 'Message your researcher';

  return (
    <Animated.View entering={ZoomIn.springify()} style={[styles.wrap, { bottom }, bounce]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => {
          haptics.tap();
          router.push('/chat');
        }}
        style={styles.edge}
      >
        {({ pressed }) => (
          <View style={[styles.face, { transform: [{ translateY: pressed ? 0 : -EDGE }] }]}>
            <ChatIcon color={colors.onPrimary} />
          </View>
        )}
      </Pressable>

      {unread > 0 && (
        <View style={styles.badge} pointerEvents="none">
          <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 20 },
  edge: {
    width: CHAT_BUTTON_SIZE,
    height: CHAT_BUTTON_SIZE,
    borderRadius: CHAT_BUTTON_SIZE / 2,
    marginTop: EDGE,
    backgroundColor: colors.primaryEdge,
    shadowColor: colors.ink,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  face: {
    width: CHAT_BUTTON_SIZE,
    height: CHAT_BUTTON_SIZE,
    borderRadius: CHAT_BUTTON_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.heavy, fontSize: 12, color: colors.onPrimary },
});
