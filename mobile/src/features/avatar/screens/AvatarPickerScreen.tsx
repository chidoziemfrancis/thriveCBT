import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { CheckIcon } from '@/components/icons';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { AVATARS } from '@/features/avatar/avatars';
import { chooseAvatar, useAvatarId } from '@/features/avatar/avatarStore';
import UserAvatar from '@/features/avatar/components/UserAvatar';
import { haptics } from '@/lib/haptics';
import { colors, type } from '@/theme';

const SIZE = 88;

export default function AvatarPickerScreen() {
  const current = useAvatarId();

  return (
    <Screen footer={<Button onPress={() => router.back()}>Done</Button>}>
      <BackButton />
      <Text style={[type.title, styles.title]}>Choose your avatar</Text>
      <Text style={type.body}>Pick one that feels like you. You can change it any time.</Text>

      <View style={styles.preview}>
        <Animated.View key={current} entering={ZoomIn.springify().damping(12)}>
          <UserAvatar size={120} />
        </Animated.View>
      </View>

      <View style={styles.grid} accessibilityRole="radiogroup">
        {AVATARS.map((avatar, i) => {
          const selected = avatar.id === current;
          return (
            <Pressable
              key={avatar.id}
              accessibilityRole="radio"
              accessibilityLabel={`Avatar ${i + 1}`}
              accessibilityState={{ selected }}
              onPress={() => {
                haptics.tick();
                chooseAvatar(avatar.id);
              }}
              style={({ pressed }) => [styles.cell, pressed && { transform: [{ scale: 0.94 }] }]}
            >
              <View style={[styles.ring, selected && styles.ringOn]}>
                <UserAvatar id={avatar.id} size={SIZE} />
              </View>
              {selected && (
                <View style={styles.check}>
                  <CheckIcon size={12} color={colors.onPrimary} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 20, marginBottom: 6 },
  preview: { alignItems: 'center', marginVertical: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  cell: { width: '31%', alignItems: 'center' },
  ring: { padding: 3, borderRadius: SIZE, borderWidth: 3, borderColor: 'transparent' },
  ringOn: { borderColor: colors.primary },
  check: {
    position: 'absolute',
    right: 8,
    bottom: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
